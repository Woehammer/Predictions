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
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md flex justify-between items-center">
      <div className="text-lg font-bold">
        <Link href="/dashboard">Predictify</Link>
      </div>
      {session && (
        <ul className="flex gap-6 items-center text-sm">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/predictions">Predictions</Link></li>
          <li><Link href="/profile">Profile</Link></li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
