import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { throttle } from 'lodash';
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

  private readonly _subscriptions = new Set<string>();

  private readonly _subscribeBuffer = new Set<string>();
  private readonly _unsubscribeBuffer = new Set<string>();

  private _publishMode = true;
  private readonly _publishBuffer = new Map<string, string>();

  private readonly _notificationPromises = new Map<string, Resolvable>();

  constructor() {
    this._values = reactive({});

    this.connect();
  }

  get(type: string, key: string) {
    const channel = `${type}.${key}`;

    this.subscribe(channel);

    return this._values[channel];
  }
  async getAsync(type: string, key: string) {
    const channel = `${type}.${key}`;

    if (this._values[channel] == null) {
      this.subscribe(channel);

      await this._notificationPromises.get(channel)!;
    }

    return this._values[channel];
  }

  set(type: string, key: string, value: string) {
    const channel = `${type}.${key}`;

    if (this._publishMode) {
      this.publish({ [channel]: value });
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

  subscribe(...channels: string[]) {
    channels = channels.filter((channel) => !this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    if (this._subscribeBuffer.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(this._subscribeFlush);
    }

    for (const channel of channels) {
      this._subscribeBuffer.add(channel);
      this._subscriptions.add(channel);
    }
  }
  private _subscribeFlush = async () => {
    await this.connected;
    await $pages.loadedPromise;

    console.log('Subscribing to', this._subscribeBuffer.values());

    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_SUBSCRIBE);
    encoding.writeVarUint(encoder, this._subscribeBuffer.size);
    for (const channel of this._subscribeBuffer) {
      encoding.writeVarString(encoder, channel);

      const [type] = channel.split('.');

      if (!type.endsWith('Notification')) {
        this._notificationPromises.set(channel, new Resolvable());
      }
    }

    this._socket.send(encoding.toUint8Array(encoder));

    this._subscribeBuffer.clear();
  };

  unsubscribe(...channels: string[]) {
    channels = channels.filter((channel) => this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    if (this._unsubscribeBuffer.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      nextTick(this._unsubscribeFlush);
    }

    for (const channel of channels) {
      this._unsubscribeBuffer.add(channel);
    }
  }
  private _unsubscribeFlush = async () => {
    await this.connected;
    await $pages.loadedPromise;

    console.log('Unsubscribing', this._unsubscribeBuffer.entries());

    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_UNSUBSCRIBE);

    encoding.writeVarUint(encoder, this._unsubscribeBuffer.size);

    for (const channel of this._unsubscribeBuffer) {
      encoding.writeVarString(encoder, channel);

      delete this._values[channel];
    }

    this._socket.send(encoding.toUint8Array(encoder));
  };

  publish(values: Record<string, string>) {
    const entries = Object.entries(values).filter(
      ([channel, value]) => this._values[channel] !== value
    );

    if (entries.length === 0) {
      return;
    }

    if (this._publishBuffer.size === 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._publishFlush();
    }

    for (const [channel, value] of entries) {
      this._publishBuffer.set(channel, value);
    }
  }
  private _publishFlush = throttle(
    async () => {
      await this.connected;
      await $pages.loadedPromise;

      console.log('Publishing', this._publishBuffer.entries());

      const encoder = new encoding.Encoder();

      encoding.writeVarUint(encoder, MSGTOSV_PUBLISH);

      encoding.writeVarUint(encoder, this._publishBuffer.size);

      for (const [channel, value] of this._publishBuffer) {
        encoding.writeVarString(encoder, channel);
        encoding.writeVarString(encoder, value);
      }

      this._socket.send(encoding.toUint8Array(encoder));

      this._publishBuffer.clear();
    },
    500,
    { leading: false }
  );

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

    this._publishMode = false;

    for (let i = 0; i < numChannels; i++) {
      const channel = decoding.readVarString(decoder);
      const value = decoding.readVarString(decoder);

      console.log(`[${channel}] Notify: ${value}`);

      const [type] = channel.split('.');

      if (type.endsWith('Notification')) {
        continue;
      }

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
