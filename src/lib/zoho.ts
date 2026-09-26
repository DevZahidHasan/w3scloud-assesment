import { cookies } from 'next/headers';

const ZOHO_API_DOMAIN = 'https://www.zohoapis.com/crm/v2';

// Helper to get access token, or refresh it if needed
export async function getValidAccessToken() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('zoho_access_token')?.value;
  const refreshToken = cookieStore.get('zoho_refresh_token')?.value;

  if (!accessToken && refreshToken) {
    const clientId = process.env.ZOHO_CLIENT_ID!;
    const clientSecret = process.env.ZOHO_CLIENT_SECRET!;

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      accessToken = data.access_token;
    }
  }

  return accessToken;
}

// Fetch Leads from Zoho CRM
export async function getZohoLeads() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    throw new Error('UNAUTHORIZED');
  }

  const response = await fetch(`${ZOHO_API_DOMAIN}/Leads`, {
    method: 'GET',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    cache: 'no-store', 
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(`Zoho API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Insert new lead into Zoho CRM
export async function createZohoLead(leadData: Record<string, unknown>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Leads`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [leadData] }),
  });

  const result = await response.json();
  if (!response.ok || (result.data && result.data[0].status === 'error')) {
    throw new Error(result.data?.[0]?.message || 'Failed to create lead');
  }
  return result.data[0].details.id;
}

// Fetch a single lead by ID from Zoho CRM
export async function getZohoLeadById(recordId: string) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Leads/${recordId}`, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to fetch newly created lead');
  const data = await response.json();
  return data.data[0];
}

// Fetch Contacts from Zoho CRM
export async function getZohoContacts() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Contacts`, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error(`Zoho API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Fetch Accounts from Zoho CRM
export async function getZohoAccounts() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Accounts`, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error(`Zoho API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

// Insert new contact into Zoho CRM
export async function createZohoContact(contactData: Record<string, unknown>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [contactData] }),
  });

  const result = await response.json();
  if (!response.ok || (result.data && result.data[0].status === 'error')) {
    throw new Error(result.data?.[0]?.message || 'Failed to create contact');
  }
  return result.data[0].details.id;
}

// Fetch a single contact by ID from Zoho CRM
export async function getZohoContactById(recordId: string) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Contacts/${recordId}`, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to fetch newly created contact');
  const data = await response.json();
  return data.data[0];
}

// Insert new account into Zoho CRM
export async function createZohoAccount(accountData: Record<string, unknown>) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Accounts`, {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: [accountData] }),
  });

  const result = await response.json();
  if (!response.ok || (result.data && result.data[0].status === 'error')) {
    throw new Error(result.data?.[0]?.message || 'Failed to create account');
  }
  return result.data[0].details.id;
}

// Fetch a single account by ID from Zoho CRM
export async function getZohoAccountById(recordId: string) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('UNAUTHORIZED');

  const response = await fetch(`${ZOHO_API_DOMAIN}/Accounts/${recordId}`, {
    method: 'GET',
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Failed to fetch newly created account');
  const data = await response.json();
  return data.data[0];
}
