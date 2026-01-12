import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import InsightsList from '../components/InsightsList'; // Import the new client component

// Update the interface to include Domain__c
interface Insight {
  Id: string;
  Title__c: string;
  Domain__c: string | null;
  Debt_Score__c: number;
  CreatedDate: string;
  View_Count__c: number;
  Last_Viewed_At__c: string;
}

// Update the SOQL query to fetch Domain__c
async function getInsights(accessToken: string, instanceUrl: string): Promise<Insight[]> {
    const query = "SELECT Id, Title__c, Domain__c, Debt_Score__c, CreatedDate, View_Count__c, Last_Viewed_At__c FROM Decision_Insight__c ORDER BY CreatedDate DESC LIMIT 100";
    const res = await fetch(`${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store', // Ensure fresh data
    });

    const data = await res.json();

    if(!res.ok) {
        console.error("Salesforce API Error:", data);
        const errorMessage = data[0]?.message || "Failed to fetch insights from Salesforce.";
        const errorCode = data[0]?.errorCode;

        if (errorCode === 'INVALID_TYPE') {
            throw new Error(`Salesforce Error: The custom object 'Decision_Insight__c' was not found. Please ensure it exists and that you have permission to access it. For detailed instructions, see the 'Salesforce Setup' section in the README.md file. (Details: ${errorMessage})`);
        }

        // This will be caught by the error boundary
        throw new Error(errorMessage);
    }

    return data.records;
}


export default async function InsightsPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.accessToken || !session.instanceUrl) {
    redirect('/');
  }

  const insights = await getInsights(session.accessToken, session.instanceUrl);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">All Decision Insights</h1>
        <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
      </header>
      
      {/* Render the client component with the fetched data */}
      <InsightsList insights={insights} />

    </main>
  );
}
