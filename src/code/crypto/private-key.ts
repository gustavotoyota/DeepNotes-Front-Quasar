import sodium from 'libsodium-wrappers';

import { decryptAssymetric, encryptAssymetric } from './crypto';

export function wrapPrivateKey(value: Uint8Array | null = null) {
  let _value = value;

  return new (class PrivateKey {
    set(value: Uint8Array | null) {
      _value = value;
    }
    clear() {
      this.set(null);
    }

    get valid(): boolean {
      return (
        _value != null && _value.length === sodium.crypto_box_SECRETKEYBYTES
      );
    }

    encrypt(
      plaintext: Uint8Array | string,
      recipientsPublicKey: Uint8Array
    ): Uint8Array {
      return encryptAssymetric(plaintext, recipientsPublicKey, _value!);
    }
    decrypt(
      nonceAndCiphertext: Uint8Array,
      sendersPublicKey: Uint8Array
    ): Uint8Array {
      return decryptAssymetric(nonceAndCiphertext, sendersPublicKey, _value!);
    }
  })();
}

export type PrivateKey = ReturnType<typeof wrapPrivateKey>;

export const privateKey = wrapPrivateKey();
