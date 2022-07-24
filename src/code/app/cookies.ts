import { Cookies } from 'quasar';

export function setCookie(
  cookies: Cookies,
  name: string,
  value: string,
  option?: {
    httpOnly?: boolean;
  }
) {
  cookies.set(name, value, {
    secure: !!process.env.PROD,
    domain: process.env.PROD ? '.deepnotes.app' : '192.168.1.4',
    path: '/',
    sameSite: 'Strict',
    httpOnly: true,

    ...option,
  });
}

export function clearCookie(cookies: Cookies, name: string) {
  cookies.remove(name, {
    domain: process.env.PROD ? '.deepnotes.app' : '192.168.1.4',
    path: '/',
  });
}
