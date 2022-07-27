import sodium from 'libsodium-wrappers';
import { DICT_GROUP_SYMMETRIC_KEY } from 'src/code/app/pages/pages';
import {
  decryptSymmetric,
  encryptAssymetric,
  encryptSymmetric,
} from 'src/code/lib/crypto/crypto';
import { privateKey } from 'src/code/lib/crypto/private-key';
import { wrapSymmetricKey } from 'src/code/lib/crypto/symmetric-key';

export async function computeDerivedKeys(email: string, password: string) {
  // Master key

  const masterKeySalt = sodium.crypto_generichash(
    sodium.crypto_pwhash_SALTBYTES,
    email
  );

  const masterKey = sodium.crypto_pwhash(
    sodium.crypto_box_SEEDBYTES,
    password,
    masterKeySalt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  // Password hash

  const passwordSalt = sodium.crypto_generichash(
    sodium.crypto_pwhash_SALTBYTES,
    password
  );

  const passwordHash = sodium.crypto_pwhash(
    sodium.crypto_box_SEEDBYTES,
    masterKey,
    passwordSalt,
    sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  );

  return {
    masterKey,

    passwordHash,
  };
}
export async function generateRandomKeys(masterKey: Uint8Array) {
  // Key pair

  const keyPair = sodium.crypto_box_keypair();

  const encryptedPrivateKey = encryptSymmetric(keyPair.privateKey, masterKey);

  // User symmetric key

  const userSymmetricKey = sodium.randombytes_buf(32);

  const encryptedUserSymmetricKey = encryptAssymetric(
    userSymmetricKey,
    keyPair.publicKey,
    keyPair.privateKey
  );

  // Group symmetric key

  const groupSymmetricKey = sodium.randombytes_buf(32);

  const encryptedGroupSymmetricKey = encryptAssymetric(
    groupSymmetricKey,
    keyPair.publicKey,
    keyPair.privateKey
  );

  return {
    publicKey: keyPair.publicKey,

    privateKey: keyPair.privateKey,
    encryptedPrivateKey,

    userSymmetricKey,
    encryptedUserSymmetricKey,

    groupSymmetricKey,
    encryptedGroupSymmetricKey,
  };
}

export function reencryptSessionPrivateKey(
  oldEncryptedPrivateKey: Uint8Array,
  oldSymmetricKey: Uint8Array,
  newSessionSymmetricKey: Uint8Array
) {
  // Decrypt private key

  const decryptedPrivateKey = decryptSymmetric(
    oldEncryptedPrivateKey,
    oldSymmetricKey
  );

  // Store private key on memory

  privateKey.set(decryptedPrivateKey);

  // Reencrypt private key

  const reencryptedPrivateKey = encryptSymmetric(
    decryptedPrivateKey,
    newSessionSymmetricKey
  );

  // Store encrypted private key on local storage

  localStorage.setItem(
    'encrypted-private-key',
    sodium.to_base64(reencryptedPrivateKey)
  );

  return decryptedPrivateKey;
}

export function reencryptSymmetricKey(
  sessionKey: Uint8Array,
  encryptedSymmetricKey: Uint8Array,
  encryptersPublicKey: Uint8Array,
  recipientsPublicKey: Uint8Array
) {
  const encryptedPrivateKey = sodium.from_base64(
    localStorage.getItem('encrypted-private-key')!
  );

  const decryptedPrivateKey = decryptSymmetric(encryptedPrivateKey, sessionKey);

  const decryptedSymmetricKey = privateKey.decrypt(
    encryptedSymmetricKey,
    encryptersPublicKey
  );

  const reencryptedSymmetricKey = encryptAssymetric(
    decryptedSymmetricKey,
    recipientsPublicKey,
    decryptedPrivateKey
  );

  return reencryptedSymmetricKey;
}

export function saveGroupSymmetricKey(
  groupId: string,
  encryptedSymmetricKey: string,
  encryptersPublicKey: string
) {
  const decryptedGroupSymmetricKey = privateKey.decrypt(
    sodium.from_base64(encryptedSymmetricKey),
    sodium.from_base64(encryptersPublicKey)
  );
  const wrappedGroupSymmetricKey = wrapSymmetricKey(decryptedGroupSymmetricKey);

  $pages.react.dict[`${DICT_GROUP_SYMMETRIC_KEY}:${groupId}`] =
    wrappedGroupSymmetricKey;
}
