import sodium from 'libsodium-wrappers';

import { createMasterKey } from './master-key';

export function encryptXChachaPoly1305(
  plaintext: Uint8Array,
  key: Uint8Array,
  additionalData: string | null = null
): string {
  const nonce = sodium.randombytes_buf(24);

  const cyphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    additionalData,
    null,
    nonce,
    key
  );

  return sodium.to_base64(nonce) + '.' + sodium.to_base64(cyphertext);
}

export function decryptXChachaPoly1305(
  noncedCyphertext: string,
  key: Uint8Array,
  additionalData: string | null = null
): Uint8Array {
  const [nonce, cyphertext] = noncedCyphertext.split('.');

  return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    sodium.from_base64(cyphertext),
    additionalData,
    sodium.from_base64(nonce),
    key
  );
}

export async function computeDerivedKeys(email: string, password: string) {
  // Master key

  const masterKeyHash = (
    await argon2.hash({
      pass: password,
      salt: email,
      type: argon2.ArgonType.Argon2id,
      hashLen: 32,
    })
  ).hash;

  const masterKey = createMasterKey(masterKeyHash);

  // Password hash

  const passwordHash = sodium.to_base64(
    (
      await argon2.hash({
        pass: masterKeyHash,
        salt: password,
        type: argon2.ArgonType.Argon2id,
      })
    ).hash
  );

  return {
    masterKeyHash,
    masterKey,

    passwordHash,
  };
}

export async function generateRandomKeys(
  masterKey: ReturnType<typeof createMasterKey>
) {
  // Key pair

  const keyPair = sodium.crypto_box_keypair();

  const encryptedPrivateKey = masterKey.encrypt(keyPair.privateKey);

  // Group symmetric key

  const symmetricKey = sodium.crypto_aead_xchacha20poly1305_ietf_keygen();

  const encryptedSymmetricKey = masterKey.encrypt(symmetricKey);

  return {
    publicKey: keyPair.publicKey,
    encryptedPrivateKey,

    encryptedSymmetricKey,
  };
}

export function reencryptSecretKeys(
  decryptedMasterKey: Uint8Array,
  decryptedPrivateKey: Uint8Array,
  sessionKey: Uint8Array
) {
  return {
    sessionEncryptedMasterKey: encryptXChachaPoly1305(
      decryptedMasterKey,
      sessionKey
    ),
    sessionEncryptedPrivateKey: encryptXChachaPoly1305(
      decryptedPrivateKey,
      sessionKey
    ),
  };
}

export function storeCryptoValues(
  encryptedMasterKey: string,
  encryptedPrivateKey: string
) {
  localStorage.setItem('encrypted-master-key', encryptedMasterKey);
  localStorage.setItem('encrypted-private-key', encryptedPrivateKey);
}

export function deleteCryptoValues() {
  localStorage.removeItem('encrypted-master-key');
  localStorage.removeItem('encrypted-private-key');
}
