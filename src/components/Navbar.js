import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const session = useSession();
  const supabase = useSupabaseClient();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setVisible(false); // Scrolling down
      } else {
        setVisible(true); // Scrolling up
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; // Redirect to homepage or login
  };

  return (
    <nav
      className={`bg-gray-900 text-white px-4 py-3 shadow-md sticky top-0 z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="font-bold text-lg">
          <Link href="/" className="hover:text-gray-300">
            Predictify
          </Link>
        </div>
        <div className="space-x-4 text-sm">
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/predictions" className="hover:text-gray-300">
            Predictions
          </Link>
          <Link href="/profile" className="hover:text-gray-300">
            Profile
          </Link>
          {session && (
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
