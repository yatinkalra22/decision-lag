'use client';

import { useRef, useState } from 'react';
import Script from 'next/script';

interface TableauDashboardProps {
  accessToken: string;
  instanceUrl: string;
  dashboardId?: string;
}

/**
 * TableauDashboard Component
 *
 * Embeds a Salesforce CRM Analytics dashboard using the Wave SDK.
 * Uses Frontdoor URL authentication from the user's existing Salesforce OAuth session.
 */
export default function TableauDashboard({
  accessToken,
  instanceUrl,
  dashboardId = 'Decision_Lag_Control_Center'
}: TableauDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [dashboardLoaded, setDashboardLoaded] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  /**
   * Fetches the Frontdoor URL from our backend API
   */
  const getFrontdoorUrl = async (): Promise<string> => {
    const response = await fetch('/api/tableau/frontdoor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        instanceUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get frontdoor URL');
    }

    const data = await response.json();
    return data.frontdoorUrl;
  };

  /**
   * Loads and embeds the CRM Analytics dashboard
   */
  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Get the frontdoor URL
      const frontdoorUrl = await getFrontdoorUrl();

      // Step 2: Wait for SDK to be loaded
      if (!sdkLoaded) {
        throw new Error('CRM Analytics SDK not loaded yet');
      }

      // Step 3: Clear any existing dashboard
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Step 4: Create iframe with frontdoor URL
      // The frontdoor URL will authenticate the user and redirect to the dashboard

      // Create an iframe to embed the dashboard
      const iframe = document.createElement('iframe');
      iframe.src = frontdoorUrl + `?retURL=${encodeURIComponent(`/analytics/wave/dashboard/${dashboardId}`)}`;
      iframe.style.width = '100%';
      iframe.style.height = '800px';
      iframe.style.border = 'none';
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups');

      if (containerRef.current) {
        containerRef.current.appendChild(iframe);
      }

      setDashboardLoaded(true);
      console.log('Dashboard loaded successfully');

    } catch (err: any) {
      console.error('Error loading dashboard:', err);

      // Show "coming soon" message for any errors
      setError(
        <div>
          <div className="font-semibold text-lg mb-3">
            📊 Dashboard Coming Soon
          </div>
          <div className="text-sm mb-3">
            We&apos;re currently integrating with Tableau Next Embedding (Salesforce CRM Analytics).
            The dashboard will be available soon!
          </div>
          <div className="text-xs opacity-75 mt-4 pt-3 border-t border-red-200">
            <details>
              <summary className="cursor-pointer hover:text-red-900">Technical Details (for developers)</summary>
              <div className="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                {err.hint ? (
                  <div>
                    <div className="font-semibold mb-1">{err.message || err.error || 'Error'}</div>
                    <div className="whitespace-pre-line">{err.hint}</div>
                    {err.details && <div className="mt-1">Details: {err.details}</div>}
                  </div>
                ) : (
                  <div>{err instanceof Error ? err.message : 'Failed to load dashboard'}</div>
                )}
              </div>
            </details>
          </div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Load CRM Analytics SDK */}
      <Script
        src={`${instanceUrl}/analytics/wave/sdk/sdk.js`}
        onLoad={() => setSdkLoaded(true)}
        onError={() => setError('Failed to load CRM Analytics SDK (Coming Soon)')}
      />

      {/* Load Dashboard Button */}
      {!dashboardLoaded && (
        <div className="mb-4">
          <button
            onClick={loadDashboard}
            disabled={loading || !sdkLoaded}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading Dashboard...' : 'Load Decision Lag Dashboard'}
          </button>
        </div>
      )}

      {/* Coming Soon / Info Display */}
      {error && (
        <div className="mb-4 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <div className="text-blue-900">
                {typeof error === 'string' ? (
                  <div>{error}</div>
                ) : (
                  error
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Authenticating and loading dashboard...
          </div>
        </div>
      )}

      {/* Dashboard Container */}
      <div
        id="analytics-container"
        ref={containerRef}
        className="w-full min-h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-white"
      />
    </div>
  );
}

