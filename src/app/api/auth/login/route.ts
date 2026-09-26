import { NextResponse } from 'next/server';

// Redirect to Zoho OAuth consent screen
export async function GET() {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const redirectUri = process.env.ZOHO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Missing Zoho credentials in .env.local' }, { status: 500 });
  }

  // Zoho Accounts URL for OAuth
  const zohoAuthUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${clientId}&scope=ZohoCRM.modules.ALL,ZohoCRM.settings.ALL&redirect_uri=${redirectUri}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(zohoAuthUrl);
}
