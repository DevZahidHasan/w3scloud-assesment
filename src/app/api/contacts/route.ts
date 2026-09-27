import { NextResponse } from 'next/server';
import { getZohoContacts, createZohoContact, getZohoContactById } from '@/lib/zoho';

// Fetch all contacts from Zoho CRM API
export async function GET() {
  try {
    const contacts = await getZohoContacts();
    
    const formattedContacts = contacts.map((contact: Record<string, string | Record<string, string>>) => ({
      id: contact.id,
      name: contact.Full_Name || `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim(),
      email: contact.Email || 'N/A',
      company: (contact.Account_Name as Record<string, string>)?.name || 'N/A',
      phone: contact.Phone || contact.Mobile || 'N/A',
      owner: (contact.Owner as Record<string, string>)?.name || 'N/A'
    }));

    return NextResponse.json({ success: true, data: formattedContacts });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Not authenticated with Zoho' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Handle creation of a new contact in Zoho CRM
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.First_Name || !body.Last_Name || !body.Email) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const recordId = await createZohoContact(body);
    const newContact = await getZohoContactById(recordId);

    const formattedContact = {
      id: newContact.id,
      name: newContact.Full_Name || `${newContact.First_Name || ''} ${newContact.Last_Name || ''}`.trim(),
      email: newContact.Email || 'N/A',
      company: newContact.Account_Name?.name || 'N/A',
      phone: newContact.Phone || newContact.Mobile || 'N/A',
      owner: newContact.Owner?.name || 'N/A'
    };

    return NextResponse.json({ success: true, data: formattedContact });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
import { updateZohoRecord, deleteZohoRecord } from '@/lib/zoho';

export async function PUT(request: Request) {
  try {
    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    await updateZohoRecord('Contacts', id, body);
    
    const updatedRecord = await getZohoContactById(id);
    const formattedRecord = {
      id: updatedRecord.id,
      name: updatedRecord.Full_Name || `${updatedRecord.First_Name || ''} ${updatedRecord.Last_Name || ''}`.trim(),
      email: updatedRecord.Email || 'N/A',
      phone: updatedRecord.Phone || 'N/A',
      owner: updatedRecord.Owner?.name || 'N/A'
    };
    return NextResponse.json({ success: true, data: formattedRecord });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    await deleteZohoRecord('Contacts', id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
