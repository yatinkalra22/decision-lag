import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  try {
    const { accessToken, instanceUrl } = session;

    // 🔁 IMPORTANT: confirm API name matches EXACTLY what exists in Salesforce
    const query = `
      SELECT Id, Title__c, Debt_Score__c, CreatedDate, View_Count__c, Last_Viewed_At__c
      FROM Decision_Insight__c
      ORDER BY CreatedDate DESC
      LIMIT 100
    `.trim();

    const url = `${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Salesforce API Error:', data);

      // Salesforce errors usually look like: [{ message, errorCode, fields }]
      if (Array.isArray(data) && data[0]?.errorCode === 'INVALID_TYPE') {
        return NextResponse.json(
          {
            error: `INVALID_TYPE: Object not found: Decision_Insight__c`,
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

    return NextResponse.json(data.records ?? []);
  } catch (error: any) {
    console.error('Internal Server Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
