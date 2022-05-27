import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { Resolvable } from 'src/code/utils';
import { nextTick, reactive } from 'vue';

export const MSGTOSV_SUBSCRIBE = 0;
export const MSGTOSV_UNSUBSCRIBE = 1;
export const MSGTOSV_PUBLISH = 2;

export const MSGTOCL_NOTIFY = 0;

export class AppRealtime {
  private _socket!: WebSocket;

  private readonly _values: Record<string, string | undefined>;

  connected!: Resolvable;
  synced!: Resolvable;

  private readonly _subscriptionBuffer = new Set<string>();
  private readonly _subscriptions = new Set<string>();

  private _publishMode = true;
  private readonly _publishBuffer = new Map<string, string>();

  private readonly _notificationPromises = new Map<string, Resolvable>();

  constructor() {
    this._values = reactive({});

    this.connect();
  }

  get(type: string, key: string) {
    const channel = `${type}.${key}`;

    this._subscribe([channel]);

    return this._values[channel];
  }
  async getAsync(type: string, key: string) {
    const channel = `${type}.${key}`;

    if (this._values[channel] == null) {
      this._subscribe([channel]);

      await this._notificationPromises.get(channel)!;
    }

    return this._values[channel];
  }

  set(type: string, key: string, value: string) {
    const channel = `${type}.${key}`;

    if (this._publishMode) {
      this._publish({ [channel]: value });
    } else {
      this._values[channel] = value;
    }
  }

  connect() {
    this.connected = new Resolvable();
    this.synced = new Resolvable();

    this._socket = new WebSocket(
      process.env.DEV
        ? 'ws://192.168.1.2:31074/'
        : 'wss://realtime-server.deepnotes.app/'
    );

    this._socket.binaryType = 'arraybuffer';

    this._socket.onopen = () => {
      console.log('Connected to server');

      this.connected.resolve();
    };
    this._socket.onmessage = (event) => {
      this._handleMessage(new Uint8Array(event.data as any));
    };
    this._socket.onclose = () => {
      console.log('Disconnected from server');
    };
  }

  private _subscribe(channels: string[]) {
    channels = channels.filter((channel) => !this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    if (this._subscriptionBuffer.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(async () => {
        await this.connected;

        const channels = Array.from(this._subscriptionBuffer);
        this._subscriptionBuffer.clear();

        console.log('Subscribing to', channels);

        const encoder = new encoding.Encoder();

        encoding.writeVarUint(encoder, MSGTOSV_SUBSCRIBE);
        encoding.writeVarUint(encoder, channels.length);
        for (const channel of channels) {
          encoding.writeVarString(encoder, channel);
        }

        this._socket.send(encoding.toUint8Array(encoder));
      });
    }

    for (const channel of channels) {
      this._subscriptions.add(channel);
      this._subscriptionBuffer.add(channel);
      this._notificationPromises.set(channel, new Resolvable());
    }
  }
  async unsubscribe(channels: string[]) {
    channels = channels.filter((channel) => this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    console.log('Unsubscribing from', channels);

    for (const channel of channels) {
      this._subscriptions.delete(channel);
    }

    await this.connected;

    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_UNSUBSCRIBE);

    encoding.writeVarUint(encoder, channels.length);

    for (const channel of channels) {
      encoding.writeVarString(encoder, channel);

      delete this._values[channel];
    }

    this._socket.send(encoding.toUint8Array(encoder));
  }

  _publish(values: Record<string, string>) {
    const entries = Object.entries(values).filter(
      ([channel, value]) => value !== this._values[channel]
    );

    if (entries.length === 0) {
      return;
    }

    if (this._publishBuffer.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(async () => {
        await this.connected;

        const values = Object.fromEntries(this._publishBuffer);
        this._publishBuffer.clear();

        console.log('Publishing', values);

        const encoder = new encoding.Encoder();

        encoding.writeVarUint(encoder, MSGTOSV_PUBLISH);

        encoding.writeVarUint(encoder, entries.length);

        for (const [channel, value] of entries) {
          encoding.writeVarString(encoder, channel);
          encoding.writeVarString(encoder, value);
        }

        this._socket.send(encoding.toUint8Array(encoder));
      });
    }

    for (const [channel, value] of entries) {
      this._publishBuffer.set(channel, value);
    }
  }

  private _handleMessage(message: Uint8Array) {
    const decoder = new decoding.Decoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MSGTOCL_NOTIFY:
        this._handleNotify(decoder);
        break;
      default:
        throw new Error(`Unknown message type ${messageType}`);
    }
  }
  private _handleNotify(decoder: decoding.Decoder) {
    const numChannels = decoding.readVarUint(decoder);

    console.log('Received', numChannels, 'channels');

    this._publishMode = false;

    for (let i = 0; i < numChannels; i++) {
      const channel = decoding.readVarString(decoder);
      const value = decoding.readVarString(decoder);

      this._values[channel] = value;

      if (this._notificationPromises.has(channel)) {
        this._notificationPromises.get(channel)!.resolve();
        this._notificationPromises.delete(channel);
      }
    }

    this._publishMode = true;

    this.synced.resolve();
  }
}