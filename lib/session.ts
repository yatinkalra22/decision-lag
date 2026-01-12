import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword || sessionPassword.length < 32) {
  throw new Error(
    'MISSING OR INVALID SESSION_PASSWORD. This is a critical security error and the application will not run until it is fixed. Please set the SESSION_PASSWORD environment variable in your .env.local file to a secure string of at least 32 characters and RESTART the server. You can check the status of your environment variables at /api/health.'
  );
}

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: 'decision-debt-studio-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export interface SessionData {
  isLoggedIn: boolean;
  accessToken?: string;
  instanceUrl?: string;
  refreshToken?: string;
  codeVerifier?: string;
}

export function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}