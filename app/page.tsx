import { getSession } from '@/lib/session';
import Link from 'next/link';
import CreateInsightForm from './components/CreateInsightForm';
import CreateViewEventForm from './components/CreateViewEventForm';
import Image from 'next/image';
import DecisionLagLogo from '@/app/assets/images/logo.png';

export default async function Home() {
  const session = await getSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <Link href="/">
          <Image src={DecisionLagLogo} alt="Decision Lag Logo" width={150} height={50} />
        </Link>
        <nav>
          {session.isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
                Analytics Dashboard
              </Link>
              <Link href="/insights" className="text-blue-600 hover:underline">View Insights</Link>
              <a href="/api/auth/logout" className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                Logout
              </a>
            </div>
          ) : (
            <a href="/api/auth/login" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-semibold">
              Connect to Salesforce
            </a>
          )}
        </nav>
      </header>

      {session.isLoggedIn ? (
        <>
          {/* Add Details Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Add New Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-semibold mb-2 border-b pb-2">Create New Insight</h3>
                <CreateInsightForm />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 border-b pb-2">Log a View Event</h3>
                <CreateViewEventForm />
              </div>
            </div>
          </section>

          {/* List Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Recent Insights</h2>
            <p className="text-gray-700">
              Check out all your insights on the dedicated <Link href="/insights" className="text-blue-600 hover:underline">Insights page</Link>
            </p>
          </section>
        </>
      ) : (
        <div className="text-center mt-16 bg-gray-50 p-8 rounded-lg">
          <p className="text-lg text-gray-600">Please connect to Salesforce to get started.</p>
        </div>
      )}

      <footer className="text-center mt-16 text-sm text-gray-500">
        <p>Having issues? Check the <Link href="/api/health" className="text-blue-600 hover:underline" target="_blank">Health Status</Link> of your environment variables.</p>
      </footer>
    </main>
  );
}
