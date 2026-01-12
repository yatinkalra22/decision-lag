'use client';

import { useState, useMemo } from 'react';

// Define the shape of an insight record
interface Insight {
  Id: string;
  Title__c: string;
  Domain__c: string | null;
  Debt_Score__c: number;
  CreatedDate: string;
  View_Count__c: number;
  Last_Viewed_At__c: string;
}

// Define the props for the component
interface InsightsListProps {
  insights: Insight[];
}

export default function InsightsList({ insights }: InsightsListProps) {
  const [filterDomain, setFilterDomain] = useState('All');

  const uniqueDomains = useMemo(() => {
    const domains = Array.from(new Set(insights.map(insight => insight.Domain__c).filter(domain => domain != null)));
    if (insights.some(insight => !insight.Domain__c)) {
      if (!domains.includes('Unassigned')) {
          domains.push('Unassigned');
      }
    }
    domains.sort();
    return domains;
  }, [insights]);

  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
        if (filterDomain === 'All') return true;
        if (filterDomain === 'Unassigned') return !insight.Domain__c;
        return insight.Domain__c === filterDomain;
      });
  }, [insights, filterDomain]);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="flex items-center gap-2">
            <label htmlFor="domainFilter" className="block text-sm font-medium text-gray-700">Filter by Domain:</label>
            <select
                id="domainFilter"
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
                <option value="All">All</option>
                {uniqueDomains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                ))}
            </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font--medium text-gray-500 uppercase tracking-wider">Domain</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debt Score</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View Count</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Viewed</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInsights.map((insight) => (
              <tr key={insight.Id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insight.Title__c}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.Domain__c || 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.Debt_Score__c?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(insight.CreatedDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.View_Count__c || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insight.Last_Viewed_At__c ? new Date(insight.Last_Viewed_At__c).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
            {filteredInsights.length === 0 && (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                        {insights.length > 0 ? 'No insights match the current filter.' : 'No insights found. Create one from the home page!'}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
