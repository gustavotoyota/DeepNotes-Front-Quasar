import sodium from 'libsodium-wrappers';

export let privateKey: PrivateKey;

export function storePrivateKey(value: PrivateKey | Uint8Array) {
  if (value instanceof PrivateKey) {
    privateKey = value;
  } else {
    privateKey = new PrivateKey(value);
  }
}

export class PrivateKey {
  #privateKey: Uint8Array;

  constructor(value: Uint8Array) {
    this.#privateKey = value;
  }

  decrypt(nonceAndCyphertext: string, publicKey: Uint8Array): Uint8Array {
    const [nonce, cyphertext] = nonceAndCyphertext.split('.');

    return sodium.crypto_box_open_easy(
      sodium.from_base64(cyphertext),
      sodium.from_base64(nonce),
      publicKey,
      this.#privateKey
    );
  }
}
