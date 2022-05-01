import sodium, { to_base64 } from 'libsodium-wrappers';

export function encryptXChachaPoly1305(
  data: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): string {
  const nonce = sodium.randombytes_buf(24);

  const cyphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    data,
    additionalData,
    null,
    nonce,
    key
  );

  return sodium.to_base64(nonce) + '.' + sodium.to_base64(cyphertext);
}

export function decryptXChachaPoly1305(
  data: string,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const [nonce, cyphertext] = data.split('.');

  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.from_base64(cyphertext),
    additionalData,
    sodium.from_base64(nonce),
    key
  );
}

export async function computeKeys(email: string, password: string) {
  // Master key

  const masterKey = await argon2.hash({
    pass: password,
    salt: email,
    type: argon2.ArgonType.Argon2id,
    hashLen: 32,
  });

  // Password hash

  const passwordHash = to_base64(
    (
      await argon2.hash({
        pass: masterKey.hash,
        salt: password,
        type: argon2.ArgonType.Argon2id,
      })
    ).hash
  );

  // Key pair

  const sodiumKeyPair = sodium.crypto_box_keypair();

  const encryptedPrivateKey = encryptXChachaPoly1305(
    sodiumKeyPair.privateKey,
    masterKey.hash
  );

  // Group symmetric key

  const symmetricKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();

  const encryptedSymmetricKey = encryptXChachaPoly1305(
    symmetricKey,
    masterKey.hash
  );

  return {
    masterKey: masterKey,

    passwordHash: passwordHash,

    publicKey: sodiumKeyPair.publicKey,
    encryptedPrivateKey,

    encryptedSymmetricKey,
  };
}
