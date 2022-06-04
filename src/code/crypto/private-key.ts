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

    exists(): boolean {
      return _value != null;
    }

    encrypt(
      nonceAndPlaintext: Uint8Array,
      recipientsPublicKey: Uint8Array
    ): Uint8Array {
      return encryptAssymetric(nonceAndPlaintext, recipientsPublicKey, _value!);
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
