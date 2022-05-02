import { decryptXChachaPoly1305, encryptXChachaPoly1305 } from './crypto';

export class MasterKey {
  #masterKey: Uint8Array;

  constructor(value: Uint8Array) {
    this.#masterKey = value;
  }

  encrypt(plaintext: Uint8Array): string {
    return encryptXChachaPoly1305(plaintext, this.#masterKey);
  }
  decrypt(noncedCyphertext: string): Uint8Array {
    return decryptXChachaPoly1305(noncedCyphertext, this.#masterKey);
  }
}
