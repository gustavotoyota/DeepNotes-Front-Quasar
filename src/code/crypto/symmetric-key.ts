import sodium from 'libsodium-wrappers';

import { decryptSymmetric, encryptSymmetric } from './crypto';

export function wrapSymmetricKey(value: Uint8Array | null = null) {
  let _value = value;

  return new (class SymmetricKey {
    set(value: Uint8Array | null) {
      _value = value;
    }
    clear() {
      this.set(null);
    }

    get valid(): boolean {
      return (
        _value != null &&
        _value.length === sodium.crypto_aead_xchacha20poly1305_IETF_KEYBYTES
      );
    }

    encrypt(
      plaintext: Uint8Array | string,
      additionalData: string | null = null
    ): Uint8Array {
      return encryptSymmetric(plaintext, _value!, additionalData);
    }
    decrypt(
      nonceAndCiphertext: Uint8Array,
      additionalData: string | null = null
    ): Uint8Array {
      return decryptSymmetric(nonceAndCiphertext, _value!, additionalData);
    }
  })();
}

export type SymmetricKey = ReturnType<typeof wrapSymmetricKey>;
