import { getSession } from '@/lib/session';
import Link from 'next/link';
import CreateInsightForm from './components/CreateInsightForm';
import CreateViewEventForm from './components/CreateViewEventForm';

export default async function Home() {
  const session = await getSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Decision Debt Studio</h1>
        <nav>
          {session.isLoggedIn ? (
            <div className="flex items-center gap-4">
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

      {session.isLoggedIn && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Create New Insight</h2>
            <CreateInsightForm />
          </section>
          <section>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Log a View Event</h2>
            <CreateViewEventForm />
          </section>
        </div>
      )}

      {!session.isLoggedIn && (
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
