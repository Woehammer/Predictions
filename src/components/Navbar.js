import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 shadow-md text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Site Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-blue-600">Predictify</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          </div>

          {/* Menu Links */}
          <div className={`flex-col md:flex-row md:flex ${menuOpen ? 'flex' : 'hidden'} w-full md:w-auto`}>
            <Link href="/dashboard" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 md:hover:bg-transparent md:text-base">
              Dashboard
            </Link>
            <Link href="/predictions" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 md:hover:bg-transparent md:text-base">
              Predictions
            </Link>
            <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 md:hover:bg-transparent md:text-base">
              Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
