'use client';

import { useState } from 'react';

export default function DecisionInsightForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [impact, setImpact] = useState(1);
  const [risk, setRisk] = useState(1);
  const [confidence, setConfidence] = useState(50);
  const [status, setStatus] = useState('New');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculateDebtScore = () => {
    return impact * 10 + risk * 7 + (100 - confidence);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const debtScore = calculateDebtScore();
    const data = {
      Title__c: title,
      Description__c: description,
      Impact__c: impact,
      Risk__c: risk,
      Confidence__c: confidence,
      Status__c: status,
      Debt_Score__c: debtScore,
    };

    try {
      const response = await fetch('/api/decision-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');
      setImpact(1);
      setRisk(1);
      setConfidence(50);
      setStatus('New');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="impact" className="block text-sm font-medium text-gray-700">
          Impact (1-5)
        </label>
        <select
          name="impact"
          id="impact"
          value={impact}
          onChange={(e) => setImpact(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </.select>
      </div>
      <div>
        <label htmlFor="risk" className="block text-sm font-medium text-gray-700">
          Risk (1-5)
        </label>
        <select
          name="risk"
          id="risk"
          value={risk}
          onChange={(e) => setRisk(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="confidence" className="block text-sm font-medium text-gray-700">
          Confidence (0-100)
        </label>
        <input
          type="number"
          name="confidence"
          id="confidence"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          min="0"
          max="100"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="New">New</option>
          <option value="Actioned">Actioned</option>
        </select>
      </div>
      <div>
        <p>Calculated Debt Score: {calculateDebtScore()}</p>
      </div>

      {loading && <p>Creating insight...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">Insight created successfully!</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Decision Insight'}
      </button>
    </form>
  );
}
