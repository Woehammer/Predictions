import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        {/* Site Title */}
        <div className="text-lg font-bold">
          <Link href="/dashboard">Predictify</Link>
        </div>

        {/* Nav Items */}
        {session && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/predictions" className="hover:underline">
              Predictions
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
