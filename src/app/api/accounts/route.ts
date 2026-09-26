import { NextResponse } from 'next/server';
import { getZohoAccounts, createZohoAccount, getZohoAccountById } from '@/lib/zoho';

// Fetch all accounts from Zoho CRM API
export async function GET() {
  try {
    const accounts = await getZohoAccounts();
    
    const formattedAccounts = accounts.map((account: Record<string, string | Record<string, string>>) => ({
      id: account.id,
      name: account.Account_Name || 'N/A',
      phone: account.Phone || 'N/A',
      website: account.Website || 'N/A',
      owner: (account.Owner as Record<string, string>)?.name || 'N/A'
    }));

    return NextResponse.json({ success: true, data: formattedAccounts });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Not authenticated with Zoho' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Handle creation of a new account in Zoho CRM
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.Account_Name) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const recordId = await createZohoAccount(body);
    const newAccount = await getZohoAccountById(recordId);

    const formattedAccount = {
      id: newAccount.id,
      name: newAccount.Account_Name || 'N/A',
      phone: newAccount.Phone || 'N/A',
      website: newAccount.Website || 'N/A',
      owner: newAccount.Owner?.name || 'N/A'
    };

    return NextResponse.json({ success: true, data: formattedAccount });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
