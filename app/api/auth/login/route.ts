import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

// Helper function to generate a PKCE code verifier
function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper function to generate a PKCE code challenge
function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET() {
  let { SF_LOGIN_URL, SF_CLIENT_ID, SF_REDIRECT_URI } = process.env;

  if (SF_LOGIN_URL && SF_LOGIN_URL.includes('=')) {
    SF_LOGIN_URL = SF_LOGIN_URL.split('=').pop();
  }

  if (SF_LOGIN_URL) {
    SF_LOGIN_URL = SF_LOGIN_URL.replace(/\/+$/, "");
  }
  
  if (!SF_LOGIN_URL || !SF_CLIENT_ID || !SF_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Salesforce environment variables are not set' },
      { status: 500 }
    );
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const session = await getSession();
  session.codeVerifier = codeVerifier;
  await session.save();

  const params = new URLSearchParams({
    client_id: SF_CLIENT_ID,
    redirect_uri: SF_REDIRECT_URI,
    response_type: 'code',
    scope: 'api refresh_token',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authorizationUrl = `${SF_LOGIN_URL}/services/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(authorizationUrl);
}
