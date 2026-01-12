'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function CreateInsightForm() {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState(''); // New state for Domain
  
  const [impact, setImpact] = useState(3);
  const [risk, setRisk] = useState(3);
  const [confidence, setConfidence] = useState(80);
  const [status, setStatus] = useState('New');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const calculateDebtScore = () => {
    const daysOpen = 5; // MVP assumption
    return daysOpen * impact * risk * (confidence / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) {
      toast.error('Please select a domain.');
      return;
    }
    setLoading(true);
    const toastId = toast.loading('Creating insight...');

    const debtScore = calculateDebtScore();
    const data = {
      Title__c: title,
      Domain__c: domain, // Add domain to payload
      Impact__c: impact,
      Risk__c: risk,
      Confidence__c: confidence,
      Status__c: status,
      Debt_Score__c: debtScore,
    };

    try {
      const response = await fetch('/api/salesforce/insights/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create insight');
      }

      toast.success('Insight created successfully!', { id: toastId });
      router.refresh();
      // Reset form
      setTitle('');
      setDomain(''); // Reset domain
      
      setImpact(3);
      setRisk(3);
      setConfidence(80);
      setStatus('New');
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const domainOptions = ["Security", "Finance", "Sales", "HR", "Other"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700">Domain <span className="text-red-500">*</span></label>
        <select id="domain" value={domain} onChange={(e) => setDomain(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            <option value="" disabled>Select a domain</option>
            {domainOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="impact" className="block text-sm font-medium text-gray-700">Impact <span className="text-red-500">*</span></label>
          <select id="impact" value={impact} onChange={(e) => setImpact(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="risk" className="block text-sm font-medium text-gray-700">Risk <span className="text-red-500">*</span></label>
          <select id="risk" value={risk} onChange={(e) => setRisk(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="confidence" className="block text-sm font-medium text-gray-700">Confidence ({confidence}%) <span className="text-red-500">*</span></label>
        <input type="range" id="confidence" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} min="0" max="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          <option>New</option>
          <option>Actioned</option>
        </select>
      </div>
      <div className="pt-2">
        <p className="text-sm text-gray-600">Calculated Debt Score: <span className="font-bold">{calculateDebtScore().toFixed(2)}</span></p>
      </div>
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
        {loading ? 'Submitting...' : 'Submit Insight'}
      </button>
    </form>
  );
}
