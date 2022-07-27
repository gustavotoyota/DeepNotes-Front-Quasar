import sodium from 'libsodium-wrappers';
import { concatUint8Array } from 'src/code/lib/utils';

export function encryptAssymetric(
  plaintext: Uint8Array | string,
  recipientsPublicKey: Uint8Array,
  sendersPrivateKey: Uint8Array
): Uint8Array {
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);

  const ciphertext = sodium.crypto_box_easy(
    plaintext,
    nonce,
    recipientsPublicKey,
    sendersPrivateKey
  );

  return concatUint8Array(nonce, ciphertext);
}
export function decryptAssymetric(
  nonceAndCiphertext: Uint8Array,
  sendersPublicKey: Uint8Array,
  recipientsPrivateKey: Uint8Array
): Uint8Array {
  const nonce = nonceAndCiphertext.slice(0, sodium.crypto_box_NONCEBYTES);
  const ciphertext = nonceAndCiphertext.slice(sodium.crypto_box_NONCEBYTES);

  return sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    sendersPublicKey,
    recipientsPrivateKey
  );
}

export function encryptSymmetric(
  plaintext: Uint8Array | string,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    additionalData,
    null,
    nonce,
    key
  );

  return concatUint8Array(nonce, ciphertext);
}
export function decryptSymmetric(
  nonceAndCiphertext: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const nonce = nonceAndCiphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES);
  const ciphertext = nonceAndCiphertext.slice(
    sodium.crypto_secretbox_NONCEBYTES
  );

  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    additionalData,
    nonce,
    key
  );
}
