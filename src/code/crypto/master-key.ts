import { decryptXChachaPoly1305, encryptXChachaPoly1305 } from './crypto';

export function createMasterKey(value: Uint8Array | null = null) {
  let _value = value;

  return new (class MasterKey {
    set(value: Uint8Array | null) {
      _value = value;
    }
    clear() {
      this.set(null);
    }

    exists(): boolean {
      return _value != null;
    }

    encrypt(plaintext: Uint8Array): string {
      return encryptXChachaPoly1305(plaintext, _value!);
    }
    decrypt(nonceAndCyphertext: string): Uint8Array {
      return decryptXChachaPoly1305(nonceAndCyphertext, _value!);
    }
  })();
}

export const masterKey = createMasterKey();
