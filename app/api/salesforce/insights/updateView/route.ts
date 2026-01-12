import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const { insightId } = await req.json();
    const { accessToken, instanceUrl } = session;

    if (!insightId) {
      return NextResponse.json({ error: 'Missing insightId' }, { status: 400 });
    }

    // First, get the current View_Count__c
    const query = `SELECT View_Count__c FROM Decision_Insight__c WHERE Id = '${insightId}'`;
    const getRes = await fetch(`${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const getData = await getRes.json();
    if (!getRes.ok || getData.records.length === 0) {
        console.error('Salesforce API Error (GET):', getData);
        return NextResponse.json({ error: 'Failed to fetch insight or insight not found', details: getData }, { status: getRes.status });
    }

    const currentViewCount = getData.records[0].View_Count__c || 0;
    const newViewCount = currentViewCount + 1;

    const body = {
      Last_Viewed_At__c: new Date().toISOString(),
      View_Count__c: newViewCount,
    };

    const res = await fetch(`${instanceUrl}/services/data/v60.0/sobjects/Decision_Insight__c/${insightId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
        // Salesforce returns 204 No Content on successful PATCH
        if (res.status === 204) {
            return new NextResponse(null, { status: 204 });
        }
      const data = await res.text(); // Use text() as there might not be a JSON body on error
      console.error('Salesforce API Error (PATCH):', data);
      return NextResponse.json({ error: 'Salesforce API error on update', details: data }, { status: res.status });
    }

    return new NextResponse(null, { status: 204 });

  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
