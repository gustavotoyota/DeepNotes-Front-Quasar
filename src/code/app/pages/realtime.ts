import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import { throttle } from 'lodash';
import { Notify } from 'quasar';
import { saveGroupSymmetricKey } from 'src/code/app/crypto/crypto';
import { rolesMap } from 'src/code/app/roles';
import { ClientSocket } from 'src/code/lib/client-socket';
import { Resolvable } from 'src/code/lib/resolvable';
import { nextTick, reactive } from 'vue';

import { DICT_GROUP_SYMMETRIC_KEY } from './pages';

export const REALTIME_USER_NOTIFICATION = 'user-notification';
export const REALTIME_ENCRYPTED_GROUP_NAME = 'encrypted-group-name';
export const REALTIME_ENCRYPTED_PAGE_TITLE = 'encrypted-page-title';
export const REALTIME_USER_DISPLAY_NAME = 'user-display-name';

export const NOTIFICATION_GROUP_REQUEST_ACCEPTED = 'group-request-accepted';
export const NOTIFICATION_GROUP_REQUEST_REJECTED = 'group-request-rejected';
export const NOTIFICATION_GROUP_INVITATION_SENT = 'group-invitation-sent';
export const NOTIFICATION_GROUP_INVITATION_CANCELLED =
  'group-invitation-cancelled';
export const NOTIFICATION_GROUP_USER_ROLE_CHANGED = 'group-user-role-changed';
export const NOTIFICATION_GROUP_USER_REMOVED = 'group-user-removed';

const MSGTOSV_SUBSCRIBE = 0;
const MSGTOSV_UNSUBSCRIBE = 1;
const MSGTOSV_PUBLISH = 2;

const MSGTOCL_NOTIFY = 0;

export class AppRealtime extends ClientSocket {
  private readonly _values: Record<string, string | undefined> = reactive({});

  syncPromise!: Resolvable;

  private readonly _subscriptions = new Set<string>();

  private readonly _subscribeBuffer = new Set<string>();
  private readonly _unsubscribeBuffer = new Set<string>();

  private _autoPublish = true;
  private readonly _publishBuffer = new Map<string, string>();

  private readonly _notificationPromises = new Map<string, Resolvable>();

  constructor(url: string) {
    super(url);

    this.connect();
  }

  connect() {
    super.connect();

    this.syncPromise = new Resolvable();

    this.socket.addEventListener('open', async () => {
      for (const subscription of this._subscriptions) {
        this._subscribeBuffer.add(subscription);
      }

      await Promise.all([
        this._subscribeFlush(),
        this._publishFlush(),
        this._unsubscribeFlush(),
      ]);
    });

    this.socket.addEventListener('message', (event) => {
      this._handleMessage(new Uint8Array(event.data as any));
    });
  }

  get(type: string, key: string) {
    const channel = `${type}:${key}`;

    this.subscribe(channel);

    return this._values[channel];
  }
  async getAsync(type: string, key: string) {
    const channel = `${type}:${key}`;

    if (this._values[channel] == null) {
      this.subscribe(channel);

      await this._notificationPromises.get(channel)!;
    }

    return this._values[channel];
  }

  set(type: string, key: string, value: string) {
    const channel = `${type}:${key}`;

    if (this._autoPublish) {
      this.publish({ [channel]: value });
    } else {
      this._values[channel] = value;
    }
  }

  subscribe(...channels: string[]) {
    channels = channels.filter((channel) => !this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    if (this._subscribeBuffer.size === 0) {
      void nextTick(this._subscribeFlush);
    }

    for (const channel of channels) {
      this._subscribeBuffer.add(channel);
      this._subscriptions.add(channel);

      const type = channel.split(':')[0];

      if (!type.endsWith('-notification')) {
        this._notificationPromises.set(channel, new Resolvable());
      }
    }
  }
  private _subscribeFlush = async () => {
    await this.connectPromise;
    await $pages.loadPromise;

    if (this._subscribeBuffer.size === 0) {
      return;
    }

    console.log('Subscribing to', this._subscribeBuffer.values());

    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_SUBSCRIBE);
    encoding.writeVarUint(encoder, this._subscribeBuffer.size);
    for (const channel of this._subscribeBuffer) {
      encoding.writeVarString(encoder, channel);
    }

    this.socket.send(encoding.toUint8Array(encoder));

    this._subscribeBuffer.clear();
  };

  unsubscribe(...channels: string[]) {
    channels = channels.filter((channel) => this._subscriptions.has(channel));

    if (channels.length === 0) {
      return;
    }

    if (this._unsubscribeBuffer.size === 0) {
      void nextTick(this._unsubscribeFlush);
    }

    for (const channel of channels) {
      this._unsubscribeBuffer.add(channel);
    }
  }
  private _unsubscribeFlush = async () => {
    await this.connectPromise;
    await $pages.loadPromise;

    if (this._unsubscribeBuffer.size === 0) {
      return;
    }

    console.log('Unsubscribing', this._unsubscribeBuffer.entries());

    const encoder = new encoding.Encoder();

    encoding.writeVarUint(encoder, MSGTOSV_UNSUBSCRIBE);

    encoding.writeVarUint(encoder, this._unsubscribeBuffer.size);

    for (const channel of this._unsubscribeBuffer) {
      encoding.writeVarString(encoder, channel);

      delete this._values[channel];
    }

    this.socket.send(encoding.toUint8Array(encoder));

    this._unsubscribeBuffer.clear();
  };

  publish(values: Record<string, string>) {
    const entries = Object.entries(values).filter(
      ([channel, value]) => this._values[channel] !== value
    );

    if (entries.length === 0) {
      return;
    }

    if (this._publishBuffer.size === 0) {
      void this._publishFlush();
    }

    for (const [channel, value] of entries) {
      this._publishBuffer.set(channel, value);
    }
  }
  private _publishFlush = throttle(
    async () => {
      await this.connectPromise;
      await $pages.loadPromise;

      if (this._publishBuffer.size === 0) {
        return;
      }

      console.log('Publishing', this._publishBuffer.entries());

      const encoder = new encoding.Encoder();

      encoding.writeVarUint(encoder, MSGTOSV_PUBLISH);

      encoding.writeVarUint(encoder, this._publishBuffer.size);

      for (const [channel, value] of this._publishBuffer) {
        encoding.writeVarString(encoder, channel);
        encoding.writeVarString(encoder, value);
      }

      this.socket.send(encoding.toUint8Array(encoder));

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

    this._autoPublish = false;

    for (let i = 0; i < numChannels; i++) {
      const channel = decoding.readVarString(decoder);
      const value = decoding.readVarString(decoder);

      console.log(`[${channel}] Notify: ${value}`);

      const type = channel.split(':')[0];

      if (type.endsWith('-notification')) {
        const notifObj = JSON.parse(value);

        if (notifObj.type.startsWith('group')) {
          void Promise.all([
            $pages.realtime.getAsync(
              REALTIME_USER_DISPLAY_NAME,
              notifObj.data.agentId
            ),
            $pages.realtime.getAsync(
              REALTIME_ENCRYPTED_GROUP_NAME,
              notifObj.data.groupId
            ),
          ]).then(([agentDisplayName]) => {
            // Save group symmetric key

            if (
              notifObj.data.encryptedSymmetricKey != null &&
              notifObj.data.encryptersPublicKey != null
            ) {
              saveGroupSymmetricKey(
                notifObj.data.groupId,
                notifObj.data.encryptedSymmetricKey,
                notifObj.data.encryptersPublicKey
              );
            }

            // Get group name

            const groupName = $pages.react.groupNames[notifObj.data.groupId];

            // Process notification

            if (notifObj.type === NOTIFICATION_GROUP_REQUEST_ACCEPTED) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  void page.setup();
                }
              }

              Notify.create({
                message: `${agentDisplayName} has accepted your access request to the group "${groupName}".`,
                type: 'positive',
              });
            } else if (notifObj.type === NOTIFICATION_GROUP_REQUEST_REJECTED) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  page.react.status = 'unauthorized';
                  page.react.userStatus = 'rejected';
                }
              }

              Notify.create({
                message: `${agentDisplayName} has rejected your access request to the group "${groupName}".`,
                type: 'negative',
              });
            } else if (notifObj.type === NOTIFICATION_GROUP_INVITATION_SENT) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  page.react.status = 'unauthorized';
                  page.react.userStatus = 'invite';
                }
              }

              Notify.create({
                message: `${agentDisplayName} has invited you to access the group "${groupName}".`,
                type: 'info',
              });
            } else if (
              notifObj.type === NOTIFICATION_GROUP_INVITATION_CANCELLED
            ) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  page.react.status = 'unauthorized';
                  page.react.userStatus = undefined;
                }
              }

              $pages.react.dict[
                `${DICT_GROUP_SYMMETRIC_KEY}:${notifObj.data.groupId}`
              ] = null;

              Notify.create({
                message: `${agentDisplayName} has cancelled your access invitation to the group "${groupName}".`,
                type: 'negative',
              });
            } else if (notifObj.type === NOTIFICATION_GROUP_USER_ROLE_CHANGED) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  page.react.roleId = notifObj.data.roleId;
                }
              }

              Notify.create({
                message: `${agentDisplayName} has changed your role in the group "${groupName}" to ${
                  rolesMap[notifObj.data.roleId].name
                }.`,
                type: 'info',
              });
            } else if (notifObj.type === NOTIFICATION_GROUP_USER_REMOVED) {
              for (const page of $pages.pageCache.react.cache) {
                if (page.react.groupId === notifObj.data.groupId) {
                  page.react.status = 'unauthorized';
                  page.react.userStatus = undefined;
                }
              }

              $pages.react.dict[
                `${DICT_GROUP_SYMMETRIC_KEY}:${notifObj.data.groupId}`
              ] = null;

              Notify.create({
                message: `${agentDisplayName} has removed you from the group "${groupName}".`,
                type: 'negative',
              });
            }
          });
        }

        continue;
      }

      this._values[channel] = value;

      if (this._notificationPromises.has(channel)) {
        this._notificationPromises.get(channel)!.resolve();
        this._notificationPromises.delete(channel);
      }
    }

    this._autoPublish = true;

    this.syncPromise.resolve();
  }
}
