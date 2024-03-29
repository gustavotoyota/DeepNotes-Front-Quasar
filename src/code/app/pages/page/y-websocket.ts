import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { throttle } from 'lodash';
import { AppPage } from 'src/code/app/pages/page/page';
import { ClientSocket } from 'src/code/lib/client-socket';
import { SymmetricKey } from 'src/code/lib/crypto/symmetric-key';
import { Resolvable } from 'src/code/lib/resolvable';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';

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

  syncPromise!: Resolvable;

  size = 0;

  constructor(
    readonly page: AppPage,

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

    this.syncPromise = new Resolvable();

    this.socket.addEventListener('open', () => {
      // Send local awareness state

      if (this.awareness.getLocalState() !== null) {
        const encoderAwareness = encoding.createEncoder();

        encoding.writeVarUint(encoderAwareness, MESSAGE_AWARENESS);
        encoding.writeVarUint8Array(
          encoderAwareness,
          awarenessProtocol.encodeAwarenessUpdate(this.awareness, [
            this.doc.clientID,
          ])
        );

        this.send(encoding.toUint8Array(encoderAwareness), () => {
          console.log('Local awareness state sent');
        });
      }
    });

    this.socket.addEventListener('message', (event) => {
      this._handleMessage(new Uint8Array(event.data as any));
    });
  }

  send(message: Uint8Array, callback?: () => void) {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      return;
    }

    if (this.page.react.groupReadOnly) {
      return;
    }

    this.socket.send(message);

    callback?.();
  }

  // Document update handling

  private _updateBuffer: Uint8Array | null = null;

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

  private _sendSyncSingleUpdateMessage = throttle(
    () => {
      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, MESSAGE_SYNC);
      encoding.writeVarUint(encoder, MESSAGE_SYNC_SINGLE_UPDATE);

      // Send encrypted update
      const encryptedUpdate = this.symmetricKey.encrypt(this._updateBuffer!);
      this._updateBuffer = null;

      encoding.writeVarUint8Array(encoder, encryptedUpdate);

      this.send(encoding.toUint8Array(encoder), () => {
        console.log('Sync single update message sent');
      });
    },
    200,
    { leading: false }
  );

  // Awareness update handling

  private _changedClients = new Set<number>();

  private _handleAwarenessUpdate = ({
    added,
    updated,
    removed,
  }: IAwarenessChanges) => {
    for (const clientID of added.concat(updated).concat(removed)) {
      this._changedClients.add(clientID);
    }

    this._sendAwarenessMessage();
  };

  private _sendAwarenessMessage = throttle(
    () => {
      const encoder = encoding.createEncoder();

      encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          Array.from(this._changedClients)
        )
      );

      this.send(encoding.toUint8Array(encoder), () => {
        console.log('Awareness message sent');
      });

      this._changedClients.clear();
    },
    200,
    { leading: false }
  );

  // Message handling

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

  // Sync request message handling

  private _sendSyncRequestMessage() {
    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_REQUEST);

    this.send(encoding.toUint8Array(encoder), () => {
      console.log('Sync request message sent');
    });
  }

  // Update message handling

  private _handleSyncAllUpdatesUnmergedMessage(decoder: decoding.Decoder) {
    const updateEndIndex = decoding.readVarUint(decoder);

    const numUpdates = decoding.readVarUint(decoder);

    this.doc.transact(() => {
      for (let i = 0; i < numUpdates; i++) {
        this._handleSyncSingleUpdateMessage(decoder);
      }
    });

    this.syncPromise.resolve();

    setTimeout(() => {
      this._sendSyncAllUpdatesMergedMessage(updateEndIndex);
    }, 0);
  }

  private _sendSyncAllUpdatesMergedMessage(updateEndIndex: number) {
    const encoder = encoding.createEncoder();

    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    encoding.writeVarUint(encoder, MESSAGE_SYNC_ALL_UPDATES_MERGED);

    encoding.writeVarUint(encoder, updateEndIndex);

    // Send encrypted update
    const decryptedUpdate = Y.encodeStateAsUpdateV2(this.doc);
    const encryptedUpdate = this.symmetricKey.encrypt(decryptedUpdate);
    encoding.writeVarUint8Array(encoder, encryptedUpdate);

    this.send(encoding.toUint8Array(encoder), () => {
      console.log('Sync all updates merged message sent');
    });

    this.size = decryptedUpdate.length;
  }

  private _handleSyncSingleUpdateMessage(decoder: decoding.Decoder) {
    // Apply decrypted update
    const encryptedUpdate = decoding.readVarUint8Array(decoder);
    const decryptedUpdate = this.symmetricKey.decrypt(encryptedUpdate);
    Y.applyUpdateV2(this.doc, decryptedUpdate, this);
  }

  // Destruction

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
