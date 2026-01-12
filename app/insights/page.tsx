import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Insight {
  Id: string;
  Title__c: string;
  Debt_Score__c: number;
  CreatedDate: string;
  View_Count__c: number;
  Last_Viewed_At__c: string;
}

async function getInsights(accessToken: string, instanceUrl: string): Promise<Insight[]> {
    const query = "SELECT Id, Title__c, Debt_Score__c, CreatedDate, View_Count__c, Last_Viewed_At__c FROM Decision_Insight__c ORDER BY CreatedDate DESC LIMIT 100";
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

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Count</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Viewed</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insights.map((insight) => (
              <tr key={insight.Id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insight.Title__c}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.Debt_Score__c?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(insight.CreatedDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.View_Count__c || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.Last_Viewed_At__c ? new Date(insight.Last_Viewed_At__c).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
            {insights.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500">No insights found. Create one from the home page!</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
