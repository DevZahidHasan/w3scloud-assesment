import { NextResponse } from 'next/server';
import { getZohoLeads, createZohoLead, getZohoLeadById } from '@/lib/zoho';

// Fetch all leads from Zoho CRM API
export async function GET() {
  try {
    const leads = await getZohoLeads();
    
    const formattedLeads = leads.map((lead: Record<string, string | Record<string, string>>) => ({
      id: lead.id,
      name: lead.Full_Name || `${lead.First_Name || ''} ${lead.Last_Name || ''}`.trim(),
      email: lead.Email || 'N/A',
      company: lead.Company || 'N/A',
      phone: lead.Phone || 'N/A',
      lead_source: lead.Lead_Source || 'N/A',
      owner: (lead.Owner as Record<string, string>)?.name || 'N/A'
    }));

    return NextResponse.json({ success: true, data: formattedLeads });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Not authenticated with Zoho' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Handle creation of a new lead in Zoho CRM
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.First_Name || !body.Last_Name || !body.Email || !body.Company || !body.Phone) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the lead and get the returned Record ID
    const recordId = await createZohoLead(body);

    // 2. Fetch the newly inserted record directly using the returned Record ID
    const newLead = await getZohoLeadById(recordId);

    const formattedLead = {
      id: newLead.id,
      name: newLead.Full_Name || `${newLead.First_Name || ''} ${newLead.Last_Name || ''}`.trim(),
      email: newLead.Email || 'N/A',
      company: newLead.Company || 'N/A',
      phone: newLead.Phone || 'N/A',
      lead_source: newLead.Lead_Source || 'N/A',
      owner: newLead.Owner?.name || 'N/A'
    };

    return NextResponse.json({ success: true, data: formattedLead });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
import { updateZohoRecord, deleteZohoRecord } from '@/lib/zoho';

export async function PUT(request: Request) {
  try {
    const { id, ...body } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    await updateZohoRecord('Leads', id, body);
    
    // Fetch updated
    const updatedLead = await getZohoLeadById(id);
    const formattedLead = {
      id: updatedLead.id,
      name: updatedLead.Full_Name || ${updatedLead.First_Name || ''} .trim(),
      email: updatedLead.Email || 'N/A',
      company: updatedLead.Company || 'N/A',
      phone: updatedLead.Phone || 'N/A',
      lead_source: updatedLead.Lead_Source || 'N/A',
      owner: updatedLead.Owner?.name || 'N/A'
    };
    return NextResponse.json({ success: true, data: formattedLead });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    await deleteZohoRecord('Leads', id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
