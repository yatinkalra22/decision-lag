import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return NextResponse.json({ error, errorDescription }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No code found' }, { status: 400 });
  }

  const session = await getSession();
  const { codeVerifier } = session;

  if (!codeVerifier) {
    return NextResponse.json({ error: 'No code verifier found in session' }, { status: 400 });
  }

  let { SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET, SF_REDIRECT_URI } = process.env;

  if (SF_LOGIN_URL) {
    SF_LOGIN_URL = SF_LOGIN_URL.replace(/\/+$/, "");
  }

  if (!SF_LOGIN_URL || !SF_CLIENT_ID || !SF_CLIENT_SECRET || !SF_REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Salesforce environment variables are not set' },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SF_CLIENT_ID,
    client_secret: SF_CLIENT_SECRET,
    redirect_uri: SF_REDIRECT_URI,
    code,
    code_verifier: codeVerifier,
  });

  try {
    const res = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error_description || 'Salesforce token exchange failed' }, { status: 500 });
    }

    session.isLoggedIn = true;
    session.accessToken = data.access_token;
    session.refreshToken = data.refresh_token;
    session.instanceUrl = data.instance_url;
    session.codeVerifier = undefined; // Clear the code verifier
    await session.save();

    return NextResponse.redirect(new URL("/insights", req.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
