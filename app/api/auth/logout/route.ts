import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    session.destroy();

    // Explicitly delete the cookie as a fallback.
    cookies().delete('decision-debt-studio-session');

    // Redirect to the homepage with a cache-busting parameter.
    const url = new URL('/', req.url);
    url.searchParams.set('logout', 'true');
    
    return NextResponse.redirect(url, {
        // Set headers to prevent caching of the redirect response
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}