import { Resolvable } from 'src/code/lib/utils';

export class ClientSocket {
  connectPromise!: Resolvable;

  socket!: WebSocket;

  private _keepConnected = false;

  private _nextReconnectDelay = 0;

  constructor(readonly url: string) {}

  connect() {
    if (this.socket != null) {
      return;
    }

    this.connectPromise = new Resolvable();

    this._keepConnected = true;

    this.socket = new WebSocket(this.url);

    this.socket.binaryType = 'arraybuffer';

    this.socket.addEventListener('error', (event) => {
      console.error('Websocket error', event);
    });

    this.socket.addEventListener('open', (event) => {
      console.log('Websocket opened', event);

      this._nextReconnectDelay = 200;

      this.connectPromise.resolve();
    });

    this.socket.addEventListener('close', (event) => {
      console.log('Websocket closed', event);

      this.socket = null as any;

      if (this._keepConnected) {
        this._nextReconnectDelay = Math.min(4000, this._nextReconnectDelay);

        setTimeout(() => {
          this._nextReconnectDelay = this._nextReconnectDelay * 2;

          this.connect();
        }, this._nextReconnectDelay + this._nextReconnectDelay * Math.random());
      }
    });
  }

  disconnect() {
    this._keepConnected = false;

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
}
