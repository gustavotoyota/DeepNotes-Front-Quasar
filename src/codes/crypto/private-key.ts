import sodium from 'libsodium-wrappers';

export class PrivateKey {
  #privateKey: Uint8Array | null;

  constructor(value: PrivateKey | Uint8Array | null = null) {
    if (value instanceof PrivateKey) {
      this.#privateKey = value.#privateKey;
    } else {
      this.#privateKey = value;
    }
  }

  set(value: PrivateKey | Uint8Array | null) {
    if (value instanceof PrivateKey) {
      this.#privateKey = value.#privateKey;
    } else {
      this.#privateKey = value;
    }
  }
  clear() {
    this.set(null);
  }

  exists(): boolean {
    return this.#privateKey != null;
  }

  decrypt(nonceAndCyphertext: string, publicKey: Uint8Array): Uint8Array {
    const [nonce, cyphertext] = nonceAndCyphertext.split('.');

    return sodium.crypto_box_open_easy(
      sodium.from_base64(cyphertext),
      sodium.from_base64(nonce),
      publicKey,
      this.#privateKey!
    );
  }
}

export const privateKey = new PrivateKey();
