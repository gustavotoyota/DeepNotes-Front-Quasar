import { Cookies } from 'quasar';

export function setCookie(cookies: Cookies, name: string, value: string) {
  cookies.set(name, value, {
    secure: !!process.env.PROD,
    domain: process.env.PROD ? '.deepnotes.app' : '192.168.1.4',
    path: '/',
    sameSite: 'Strict',
    httpOnly: true,
  });
}
