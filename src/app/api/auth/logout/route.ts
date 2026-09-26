import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// logout functionality
export async function GET(request: Request) {
  const cookieStore = await cookies();
  
  // Clear the Zoho authentication cookies
  cookieStore.delete('zoho_access_token');
  cookieStore.delete('zoho_refresh_token');

  // Redirect back to the homepage
  return NextResponse.redirect(new URL('/', request.url));
}
