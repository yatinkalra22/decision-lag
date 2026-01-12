import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardClient from './DashboardClient';

/**
 * Dashboard Page - Server Component
 *
 * This page uses your existing Iron Session authentication.
 * It retrieves the access token and instance URL from the server-side session
 * and passes them securely to the client component.
 */
export default async function DashboardPage() {
  // Get the session from Iron Session (server-side)
  const session = await getSession();

  // Redirect to login if not authenticated
  if (!session.isLoggedIn || !session.accessToken || !session.instanceUrl) {
    redirect('/api/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Decision Lag</h1>
              <p className="text-sm text-gray-600">CRM Analytics Dashboard</p>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-blue-600 hover:underline"
              >
                Home
              </Link>
              <Link
                href="/insights"
                className="text-blue-600 hover:underline"
              >
                View Insights
              </Link>
              <a
                href="/api/auth/logout"
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">
                Decision Lag Control Center
              </h2>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                Coming Soon
              </span>
            </div>
            <p className="mt-2 text-gray-600">
              We're integrating with Tableau Next Embedding (Salesforce CRM Analytics)
            </p>
          </div>

          {/* Pass session data to client component */}
          <DashboardClient
            accessToken={session.accessToken}
            instanceUrl={session.instanceUrl}
            dashboardId="Decision_Lag_Control_Center"
          />
        </div>
      </main>
    </div>
  );
}

