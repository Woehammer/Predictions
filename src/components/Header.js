import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between">
      <div className="font-bold text-xl">Premier Predictions</div>
      <nav>
        <Link className="px-2" href="/">Home</Link>
        <Link className="px-2" href="/dashboard">Dashboard</Link>
        <Link className="px-2" href="/predictions">Predictions</Link>
        <Link className="px-2" href="/leagues">Leagues</Link>
        <Link className="px-2" href="/auth/login">Login</Link>
      </nav>
    </header>
  )
}
