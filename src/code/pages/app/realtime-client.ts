import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { Resolvable } from 'src/code/utils';
import { reactive } from 'vue';

export const MSGTOSV_SUBSCRIBE = 0;
export const MSGTOSV_UNSUBSCRIBE = 1;
export const MSGTOSV_PUBLISH = 2;

export const MSGTOCL_NOTIFY = 0;

export class RealtimeClient {
  private _socket!: WebSocket;

  values: Record<string, string>;

  connected!: Resolvable;
  synced!: Resolvable;

  constructor() {
    this.values = reactive({});

    this.connect();
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

  subscribe(channels: string[]) {
    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_SUBSCRIBE);

    encoding.writeVarUint(encoder, channels.length);

    for (const channel of channels) {
      encoding.writeVarString(encoder, channel);
    }

    this._socket.send(encoding.toUint8Array(encoder));
  }
  unsubscribe(channels: string[]) {
    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_UNSUBSCRIBE);

    encoding.writeVarUint(encoder, channels.length);

    for (const channel of channels) {
      encoding.writeVarString(encoder, channel);

      delete this.values[channel];
    }

    this._socket.send(encoding.toUint8Array(encoder));
  }

  publish(values: Record<string, string>) {
    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_PUBLISH);

    const entries = Object.entries(values);

    encoding.writeVarUint(encoder, entries.length);

    for (const [channel, value] of entries) {
      encoding.writeVarString(encoder, channel);
      encoding.writeVarString(encoder, value);
    }

    this._socket.send(encoding.toUint8Array(encoder));
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

    for (let i = 0; i < numChannels; i++) {
      const channel = decoding.readVarString(decoder);
      const value = decoding.readVarString(decoder);

      this.values[channel] = value;
    }

    this.synced.resolve();
  }
}
