'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Insight {
  Id: string;
  Title__c: string;
}

export default function CreateViewEventForm() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedInsight, setSelectedInsight] = useState('');
  const [viewerName, setViewerName] = useState('VP Ops');
  const [source, setSource] = useState('WebApp');
  const [loading, setLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setInsightsLoading(true);
      try {
        const response = await fetch('/api/salesforce/insights/list');
        if (!response.ok) throw new Error('Failed to fetch insights');
        const data = await response.json();
        setInsights(data);
        if (data.length > 0) {
          setSelectedInsight(data[0].Id);
        }
      } catch (error: any) {
        toast.error(`Could not load insights: ${error.message}`);
      } finally {
        setInsightsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInsight) {
      toast.error('Please select an insight.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Logging view event...');

    const data = {
      Insight__c: selectedInsight,
      Viewer_Name__c: viewerName,
      Source__c: source,
    };

    try {
      // Create the view event
      const response = await fetch('/api/salesforce/view-events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log view event');
      }

      // Trigger the update to the insight
      await fetch('/api/salesforce/insights/updateView', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId: selectedInsight }),
      });

      toast.success('View event logged successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="insight" className="block text-sm font-medium text-gray-700">Insight <span className="text-red-500">*</span></label>
        {insightsLoading ? <p>Loading insights...</p> : (
          <select id="insight" value={selectedInsight} onChange={(e) => setSelectedInsight(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            {insights.map(insight => (
              <option key={insight.Id} value={insight.Id}>{insight.Title__c}</option>
            ))}
          </select>
        )}
      </div>
      <div>
        <label htmlFor="viewerName" className="block text-sm font-medium text-gray-700">Viewer Name <span className="text-red-500">*</span></label>
        <input type="text" id="viewerName" value={viewerName} onChange={(e) => setViewerName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
      </div>
      <div>
        <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source <span className="text-red-500">*</span></label>
        <select id="source" value={source} onChange={(e) => setSource(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>WebApp</option>
          <option>Tableau</option>
        </select>
      </div>
      <button type="submit" disabled={loading || insightsLoading} className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400">
        {loading ? 'Logging...' : 'Log View Event'}
      </button>
    </form>
  );
}
