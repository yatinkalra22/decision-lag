import { NextResponse } from 'next/server';

export async function GET() {
  const healthcheck = {
    salesforce: {
      SF_LOGIN_URL: process.env.SF_LOGIN_URL ? 'OK' : 'MISSING',
      SF_CLIENT_ID: process.env.SF_CLIENT_ID ? 'OK' : 'MISSING',
      SF_CLIENT_SECRET: process.env.SF_CLIENT_SECRET ? 'OK' : 'MISSING',
      SF_REDIRECT_URI: process.env.SF_REDIRECT_URI ? 'OK' : 'MISSING',
    },
    session: {
      SESSION_PASSWORD:
        process.env.SESSION_PASSWORD && process.env.SESSION_PASSWORD.length >= 32
          ? 'OK'
          : 'MISSING or too short (must be >= 32 chars)',
    },
    status: 'ok',
    message: 'If any of the above are MISSING, please check your .env.local file and RESTART the server.',
  };

  return NextResponse.json(healthcheck);
}
