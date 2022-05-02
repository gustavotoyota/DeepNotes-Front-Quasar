import { decryptXChachaPoly1305, encryptXChachaPoly1305 } from './crypto';
export class MasterKey {
  #masterKey: Uint8Array | null;

  constructor(value: MasterKey | Uint8Array | null = null) {
    if (value instanceof MasterKey) {
      this.#masterKey = value.#masterKey;
    } else {
      this.#masterKey = value;
    }
  }

  set(value: MasterKey | Uint8Array | null) {
    if (value instanceof MasterKey) {
      this.#masterKey = value.#masterKey;
    } else {
      this.#masterKey = value;
    }
  }
  clear() {
    this.set(null);
  }

  exists(): boolean {
    return this.#masterKey != null;
  }

  encrypt(plaintext: Uint8Array): string {
    return encryptXChachaPoly1305(plaintext, this.#masterKey!);
  }
  decrypt(nonceAndCyphertext: string): Uint8Array {
    return decryptXChachaPoly1305(nonceAndCyphertext, this.#masterKey!);
  }
}

export const masterKey = new MasterKey();
