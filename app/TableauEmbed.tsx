'use client';

import React, { useEffect, useRef, useState } from 'react';

// Declare the types for the dynamically loaded SDK if available, or use `any`
declare global {
  interface Window {
    initializeAnalyticsSdk?: (config: any) => Promise<void>;
    AnalyticsDashboard?: any; // Assuming AnalyticsDashboard is a class/constructor
  }
}

interface TableauEmbedProps {
  authCredential: string;
  orgUrl: string;
  sdkSource: string;
}

export default function TableauEmbed({ authCredential, orgUrl, sdkSource }: TableauEmbedProps) {
  const analyticsContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authCredential || !orgUrl || !sdkSource) {
      setError("Tableau embedding configuration missing. Please provide authCredential, orgUrl, and sdkSource props.");
      setLoading(false);
      return;
    }

    const scriptId = 'tableau-analytics-sdk-script';
    let isMounted = true; // To prevent state updates on unmounted component

    const initializeAndRender = async (initializeSdk: typeof window.initializeAnalyticsSdk, DashboardClass: typeof window.AnalyticsDashboard) => {
      try {
        const config = {
          authCredential: authCredential,
          orgUrl: orgUrl,
        };

        if (initializeSdk) {
            await initializeSdk(config);
        } else {
            throw new Error("initializeAnalyticsSdk is not available.");
        }

        if (analyticsContainerRef.current && DashboardClass) {
          const dashboard = new DashboardClass({
            parentIdOrElement: analyticsContainerRef.current,
            idOrApiName: 'Decision_Lag_Control_Center'
          });
          dashboard.render();
          setLoading(false);
        } else {
            throw new Error("Analytics container ref not available or AnalyticsDashboard class not found.");
        }
      } catch (err) {
        if (isMounted) {
            setError(`Failed to initialize or render Tableau Dashboard: ${(err as Error).message}`);
            setLoading(false);
        }
      }
    };

    let script: HTMLScriptElement | null = null;

    const handleScriptLoad = async () => {
      if (!isMounted) return;
      if (window.initializeAnalyticsSdk && window.AnalyticsDashboard) {
        initializeAndRender(window.initializeAnalyticsSdk, window.AnalyticsDashboard);
      } else {
        setError("Tableau SDK loaded but 'initializeAnalyticsSdk' or 'AnalyticsDashboard' not found globally. Check SDK_SOURCE.");
        setLoading(false);
      }
    };

    const handleScriptError = (e: Event | string) => {
      if (!isMounted) return;
      setError(`Failed to load Tableau Analytics SDK from ${sdkSource}. Error: ${e instanceof Event ? e.type : e}`);
      setLoading(false);
    };

    const existingScript = document.getElementById(scriptId) as HTMLScriptElement;

    if (existingScript) {
      script = existingScript;
      // If script already exists, check if SDK is ready and render
      if (window.initializeAnalyticsSdk && window.AnalyticsDashboard) {
        initializeAndRender(window.initializeAnalyticsSdk, window.AnalyticsDashboard);
      } else {
        // Script is there but globals not ready, re-attach event listeners in case it's still loading
        script.addEventListener('load', handleScriptLoad);
        script.addEventListener('error', handleScriptError);
      }
    } else {
      script = document.createElement('script');
      script.src = sdkSource;
      script.type = 'module';
      script.async = true;
      script.id = scriptId;
      script.addEventListener('load', handleScriptLoad);
      script.addEventListener('error', handleScriptError);
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (script) {
        script.removeEventListener('load', handleScriptLoad);
        script.removeEventListener('error', handleScriptError);
        // Optional: script.remove(); if you want to remove the script from DOM on unmount
      }
    };
  }, []); // Add the missing closing brace and dependency array for useEffect

  return (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-gray-100 p-4 rounded-lg shadow-md">
      {loading && <p className="text-gray-600">Loading Tableau Dashboard...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div id="analytics-container" ref={analyticsContainerRef} className="w-full h-full">
        {/* Dashboard will be rendered here by the SDK */}
      </div>
    </div>
  );
}