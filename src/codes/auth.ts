import './indexed-db';

export const apiBaseURL = process.env.DEV
  ? 'http://localhost:21733'
  : 'https://app-server.deepnotes.app/';

export const authEndpoints = {
  login: '/auth/login',
  verify: '/auth/verify',
  refresh: '/auth/refresh',
};

export const redirectBaseURL = process.env.DEV
  ? 'http://localhost:60379'
  : 'https://deepnotes.app';

export const authRedirects = {
  home: `${redirectBaseURL}/`,
  login: `${redirectBaseURL}/login`,
  logout: `${redirectBaseURL}/`,
};

export const ACCESS_TOKEN = 'access-token';
export const REFRESH_TOKEN = 'refresh-token';
