import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { reactive } from 'vue';

export const MSGTOSV_SUBSCRIBE = 0;
export const MSGTOSV_UNSUBSCRIBE = 1;
export const MSGTOSV_PUBLISH = 2;

export const MSGTOCL_NOTIFY = 0;

export class RealtimeClient {
  socket!: WebSocket;

  values: Record<string, string>;

  constructor() {
    this.values = reactive({});

    this.connect();
  }

  connect() {
    this.socket = new WebSocket(
      process.env.CLIENT
        ? 'ws://192.168.1.2:31074/'
        : 'wss://realtime-server.deepnotes.app/'
    );

    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = () => {
      console.log('Connected to server');
    };
    this.socket.onmessage = (event) => {
      this.handleMessage(new Uint8Array(event.data as any));
    };
    this.socket.onclose = () => {
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

    this.socket.send(encoding.toUint8Array(encoder));
  }
  unsubscribe(channels: string[]) {
    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_UNSUBSCRIBE);

    encoding.writeVarUint(encoder, channels.length);

    for (const channel of channels) {
      encoding.writeVarString(encoder, channel);
    }

    this.socket.send(encoding.toUint8Array(encoder));
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

    this.socket.send(encoding.toUint8Array(encoder));
  }

  handleMessage(message: Uint8Array) {
    const decoder = new decoding.Decoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MSGTOCL_NOTIFY:
        this.handleNotify(decoder);
        break;
      default:
        throw new Error(`Unknown message type ${messageType}`);
    }
  }
  handleNotify(decoder: decoding.Decoder) {
    const numChannels = decoding.readVarUint(decoder);

    for (let i = 0; i < numChannels; i++) {
      const channel = decoding.readVarString(decoder);
      const pageName = decoding.readVarString(decoder);

      this.values[channel] = pageName;
    }
  }
}
