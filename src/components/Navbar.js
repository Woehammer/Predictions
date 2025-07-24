import { useEffect, useState } from 'react'; import Link from 'next/link'; import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'; import { Menu, X } from 'lucide-react';

export default function Navbar() { const [visible, setVisible] = useState(true); const [lastScrollY, setLastScrollY] = useState(0); const [menuOpen, setMenuOpen] = useState(false); const session = useSession(); const supabase = useSupabaseClient();

useEffect(() => { const handleScroll = () => { const currentScrollY = window.scrollY; if (currentScrollY > lastScrollY && currentScrollY > 60) { setVisible(false); } else { setVisible(true); } setLastScrollY(currentScrollY); };

window.addEventListener('scroll', handleScroll);
return () => window.removeEventListener('scroll', handleScroll);

}, [lastScrollY]);

const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/'; };

return ( <nav className={bg-gray-900 text-white px-4 py-3 shadow-md sticky top-0 z-50 transition-transform duration-300 ${ visible ? 'translate-y-0' : '-translate-y-full' }} > <div className="max-w-6xl mx-auto flex justify-between items-center"> <div className="font-bold text-lg"> <Link href="/" className="hover:text-gray-300"> Predictify </Link> </div> <div className="md:hidden"> <button onClick={() => setMenuOpen(!menuOpen)}> {menuOpen ? <X size={24} /> : <Menu size={24} />} </button> </div> <div className="hidden md:flex space-x-4 text-sm"> <Link href="/dashboard" className="hover:text-gray-300"> Dashboard </Link> <Link href="/predictions" className="hover:text-gray-300"> Predictions </Link> <Link href="/profile" className="hover:text-gray-300"> Profile </Link> {session && ( <button
onClick={handleLogout}
className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
> Log Out </button> )} </div> </div> {menuOpen && ( <div className="md:hidden mt-2 space-y-2 text-sm"> <Link href="/dashboard" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}> Dashboard </Link> <Link href="/predictions" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}> Predictions </Link> <Link href="/profile" className="block hover:text-gray-300" onClick={() => setMenuOpen(false)}> Profile </Link> {session && ( <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="block bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" > Log Out </button> )} </div> )} </nav> ); }

