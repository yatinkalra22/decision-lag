'use client';

import TableauDashboard from '../components/TableauDashboard';

interface DashboardClientProps {
  accessToken: string;
  instanceUrl: string;
  dashboardId: string;
}

/**
 * Dashboard Client Component
 * 
 * This is a client component that receives the access token and instance URL
 * from the server component (which gets them from Iron Session).
 * 
 * The access token is NOT exposed in environment variables or client-side code.
 * It's passed securely from the server-side session.
 */
export default function DashboardClient({
  accessToken,
  instanceUrl,
  dashboardId,
}: DashboardClientProps) {
  return (
    <TableauDashboard
      accessToken={accessToken}
      instanceUrl={instanceUrl}
      dashboardId={dashboardId}
    />
  );
}

