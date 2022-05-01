import sodium from 'libsodium-wrappers';

export function encrypt(data: Uint8Array, key: Uint8Array): string {
  const nonce = sodium.randombytes_buf(24);

  const cyphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    data,
    null,
    null,
    nonce,
    key
  );

  return sodium.to_base64(nonce) + '.' + sodium.to_base64(cyphertext);
}
