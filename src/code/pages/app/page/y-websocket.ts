import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { throttle } from 'lodash';
import { SymmetricKey } from 'src/code/crypto/symmetric-key';
import { Resolvable } from 'src/code/utils';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';

import { ClientSocket } from '../../static/client-socket';

export const MESSAGE_SYNC = 0;
export const MESSAGE_AWARENESS = 1;

export const MESSAGE_SYNC_REQUEST = 0;
export const MESSAGE_SYNC_ALL_UPDATES_UNMERGED = 1;
export const MESSAGE_SYNC_ALL_UPDATES_MERGED = 2;
export const MESSAGE_SYNC_SINGLE_UPDATE = 3;

interface IAwarenessChanges {
  added: number[];
  updated: number[];
  removed: number[];
}

export class WebsocketProvider extends ClientSocket {
  readonly awareness: awarenessProtocol.Awareness;

  readonly syncedPromise = new Resolvable();

  size = 0;

  private _updateBuffer: Uint8Array | null = null;

  constructor(
    readonly host: string,
    readonly roomname: string,

    readonly doc: Y.Doc,

    readonly symmetricKey: SymmetricKey
  ) {
    super(`${host}/${roomname}`);

    this.awareness = new awarenessProtocol.Awareness(doc);

    // Setup update-handling methods

    this.doc.on('updateV2', this._handleDocumentUpdate);
    this.awareness.on('update', this._handleAwarenessUpdate);

    // Setup unload handling

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', this._clearAwareness);
    } else if (typeof process !== 'undefined') {
      process.on('exit', this._clearAwareness);
    }

    this.connect();
  }
  connect() {
    super.connect();

    this.socket.addEventListener('open', () => {
      // Broadcast local awareness state

      if (this.awareness.getLocalState() !== null) {
        const encoderAwareness = encoding.createEncoder();

        encoding.writeVarUint(encoderAwareness, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoderAwareness,
          awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
            this.doc.clientID,
          ])
        );

        this.socket.send(encoding.toUint8Array(encoderAwareness));
      }
    });

    this.socket.addEventListener('message', (event) => {
      this._handleMessage(new Uint8Array(event.data as any));
    });
  }

  private _handleDocumentUpdate = (update: Uint8Array, origin: any) => {
    if (origin === this) {
      return;
    }

    if (this._updateBuffer == null) {
      this._updateBuffer = update;
    } else {
      this._updateBuffer = Y.mergeUpdatesV2([this._updateBuffer, update]);
    }

    this._sendSyncSingleUpdateMessage();
  };
  private _handleAwarenessUpdate = ({
    added,
    updated,
    removed,
  }: IAwarenessChanges) => {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    const changedClients = added.concat(updated).concat(removed);

    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
    );

    this.socket.send(encoding.toUint8Array(encoder));
  };

  private _handleMessage(message: Uint8Array) {
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case MESSAGE_SYNC:
        this._handleDocumentSyncMessage(decoder);
        break;
      case MESSAGE_AWARENESS:
        this._handleAwarenessSyncMessage(decoder);
        break;
      default:
        console.error('Unable to compute message');
    }
  }
  private _handleDocumentSyncMessage(decoder: decoding.Decoder) {
    const syncMessageType = decoding.readVarUint(decoder);

    switch (syncMessageType) {
      case MESSAGE_SYNC_ALL_UPDATES_UNMERGED:
        console.log('Sync all updates unmerged message received');
        this._handleSyncAllUpdatesUnmergedMessage(decoder);
        break;
      case MESSAGE_SYNC_SINGLE_UPDATE:
        console.log('Sync single update message received');
        this._handleSyncSingleUpdateMessage(decoder);
        break;
    }
  }
  private _handleAwarenessSyncMessage(decoder: decoding.Decoder) {
    console.log('Awareness message received');

    awarenessProtocol.applyAwarenessUpdate(
      this.awareness,
      decoding.readVarUint8Array(decoder),
      this
    );
  }

  private _sendSyncRequestMessage() {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    console.log('Sync request message sent');

    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_REQUEST);

    this.socket.send(encoding.toUint8Array(encoder));
  }

  private _handleSyncAllUpdatesUnmergedMessage(decoder: decoding.Decoder) {
    const updateEndIndex = decoding.readVarUint(decoder);

    const numUpdates = decoding.readVarUint(decoder);

    for (let i = 0; i < numUpdates; i++) {
      this._handleSyncSingleUpdateMessage(decoder);
    }

    this.syncedPromise.resolve();

    this._sendSyncAllUpdatesMergedMessage(updateEndIndex);

    if (this._updateBuffer != null) {
      this._sendSyncSingleUpdateMessage();
    }
  }

  private _sendSyncAllUpdatesMergedMessage(updateEndIndex: number) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    console.log('Sync all updates merged message sent');

    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_ALL_UPDATES_MERGED);

    encoding.writeVarUint(encoder, updateEndIndex);

    // Send encrypted update
    const decryptedUpdate = Y.encodeStateAsUpdateV2(this.doc);
    const encryptedUpdate = this.symmetricKey.encrypt(decryptedUpdate);
    encoding.writeVarUint8Array(encoder, encryptedUpdate);

    this.socket.send(encoding.toUint8Array(encoder));

    this.size = decryptedUpdate.length;
  }

  private _sendSyncSingleUpdateMessage = throttle(
    () => {
      if (this.socket?.readyState !== WebSocket.OPEN) {
        return;
      }

      console.log('Sync single update message sent');

      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      encoding.writeVarUint(encoder, MESSAGE_SYNC_SINGLE_UPDATE);

      // Send encrypted update
      const encryptedUpdate = this.symmetricKey.encrypt(this._updateBuffer!);
      this._updateBuffer = null;

      encoding.writeVarUint8Array(encoder, encryptedUpdate);

      this.socket.send(encoding.toUint8Array(encoder));
    },
    200,
    { leading: false }
  );

  private _handleSyncSingleUpdateMessage(decoder: decoding.Decoder) {
    // Apply decrypted update
    const encryptedUpdate = decoding.readVarUint8Array(decoder);
    const decryptedUpdate = this.symmetricKey.decrypt(encryptedUpdate);
    Y.applyUpdateV2(this.doc, decryptedUpdate, this);
  }

  private _clearAwareness = () => {
    awarenessProtocol.removeAwarenessStates(
      this.awareness,
      [this.doc.clientID],
      'window unload'
    );
  };

  destroy() {
    this.disconnect();

    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this._clearAwareness);
    } else if (typeof process !== 'undefined') {
      process.off('exit', this._clearAwareness);
    }

    this.awareness.off('update', this._handleAwarenessUpdate);
    this.doc.off('updateV2', this._handleDocumentUpdate);
  }
}
