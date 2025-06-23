import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 shadow-md">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Predictify logo" className="h-10" />
          <h1 className="text-2xl font-bold text-yellow-500">Predictify</h1>
        </div>
        <nav className="space-x-4">
          <Link href="/auth/login" className="text-gray-700 hover:text-yellow-500">Login</Link>
          <Link href="/auth/signup" className="text-yellow-500 font-semibold hover:underline">Sign Up</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-bold mb-4 text-gray-800">
          Predict Matches. Compete with Friends. Climb the Ranks.
        </h2>
        <p className="text-lg mb-6 text-gray-600">
          Join Predictify today and test your football knowledge in leagues with your mates.
        </p>
        <Link href="/auth/signup">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition">
            Get Started
          </button>
        </Link>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Real Fixtures</h3>
            <p className="text-gray-600">Premier League matches updated automatically each week.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Leagues with Friends</h3>
            <p className="text-gray-600">Create or join leagues to compete against your mates.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Earn Points</h3>
            <p className="text-gray-600">Predict correctly to climb the leaderboard and earn bragging rights.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm py-6 text-gray-500">
        &copy; {new Date().getFullYear()} Predictify. All rights reserved.
      </footer>
    </div>
  );
        }
