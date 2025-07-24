import Link from 'next/link';
import { useSession, useUser } from '@supabase/auth-helpers-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseclient';

export default function Navbar() {
  const session = useSession();
  const user = useUser();
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (data?.username) {
          setUsername(data.username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Site Name */}
          <div className="flex-shrink-0 text-xl font-bold text-white">
            <Link href="/">Predictify</Link>
          </div>

          {/* Hamburger for mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Menu links (desktop) */}
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/dashboard" className="hover:text-gray-300">Dashboard</Link>
            <Link href="/predictions" className="hover:text-gray-300">Predictions</Link>
            <Link href="/profile" className="hover:text-gray-300">Profile</Link>
            {username && <span className="text-sm text-gray-400">Hi, {username}</span>}
            {session && (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden mt-2 space-y-2">
            <Link href="/dashboard" className="block hover:text-gray-300">Dashboard</Link>
            <Link href="/predictions" className="block hover:text-gray-300">Predictions</Link>
            <Link href="/profile" className="block hover:text-gray-300">Profile</Link>
            {username && <p className="text-sm text-gray-400 px-1">Hi, {username}</p>}
            {session && (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
        }
