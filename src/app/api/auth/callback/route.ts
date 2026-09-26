import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Exchange OAuth code for Access and Refresh Tokens
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: 'User denied authorization' }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
  }

  const clientId = process.env.ZOHO_CLIENT_ID!;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET!;
  const redirectUri = process.env.ZOHO_REDIRECT_URI!;

  try {
    // Exchange code for tokens
    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Securely store tokens in HTTP-only cookies
    const cookieStore = await cookies();
    
    // Zoho access tokens usually expire in 1 hour (3600 seconds)
    cookieStore.set('zoho_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: data.expires_in || 3600,
      path: '/',
    });

    if (data.refresh_token) {
      // Refresh tokens are long-lived
      cookieStore.set('zoho_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    // Redirect back to the dashboard/homepage after successful login
    return NextResponse.redirect(new URL('/', request.url));

  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to exchange token', details: err.message }, { status: 500 });
  }
}
