import sodium from 'libsodium-wrappers';
import { boot } from 'quasar/wrappers';
import { logout, storeTokenExpirations } from 'src/code/app/auth';
import { reencryptSessionPrivateKey } from 'src/code/app/crypto/crypto';
import { useAuth } from 'src/stores/auth';

export default boot(async ({ store }) => {
  const auth = useAuth(store);

  if (
    !auth.loggedIn ||
    localStorage.getItem('encrypted-private-key') == null ||
    !auth.oldSessionKey ||
    !auth.newSessionKey
  ) {
    return;
  }

  try {
    storeTokenExpirations();

    const encryptedPrivateKey = sodium.from_base64(
      localStorage.getItem('encrypted-private-key')!
    );

    reencryptSessionPrivateKey(
      encryptedPrivateKey,
      sodium.from_base64(auth.oldSessionKey),
      sodium.from_base64(auth.newSessionKey)
    );
  } catch (error) {
    console.error(error);

    await logout();
  }
});
