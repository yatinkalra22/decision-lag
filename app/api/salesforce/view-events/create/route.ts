import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { accessToken, instanceUrl } = session;

    // Basic validation
    if (!body.Insight__c || !body.Viewer_Name__c || !body.Source__c) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    body.Viewed_At__c = new Date().toISOString();

    const res = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Decision_View_Event__c/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Salesforce API Error:', data);
      // Salesforce errors usually look like: [{ message, errorCode, fields }]
      if (Array.isArray(data) && data[0]?.errorCode === 'INVALID_TYPE') {
        return NextResponse.json(
          {
            error: `INVALID_TYPE: Object not found: Decision_View_Event__c`,
            hint: `Check Object Manager > your object API name. Also ensure you logged into the SAME org where you created it.`,
            details: data,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Salesforce API error', details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
