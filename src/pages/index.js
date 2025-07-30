import Link from 'next/link';
import { useEffect } from 'react';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home({ user }) {
  const { session, isLoading } = useSessionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (session?.user || user)) {
      router.push('/dashboard');
    }
  }, [session, user, isLoading, router]);

  return (
    <div className="min-h-screen bg-[url('/stadium-bg_20250725_183319_0000.jpg')] bg-cover bg-center text-white">
      <div className="min-h-screen bg-black/70 backdrop-blur-sm">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 shadow-md">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Predictify logo" width={40} height={40} />
            <h1 className="text-2xl font-bold text-yellow-400">Predictify</h1>
          </div>
          <nav className="space-x-4">
            <Link href="/auth" className="text-white hover:text-yellow-400">Login</Link>
            <Link href="/auth" className="text-yellow-400 font-semibold hover:underline">Sign Up</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <h2 className="text-4xl font-bold mb-4">Predict Matches. Compete with Friends. Climb the Ranks.</h2>
          <p className="text-lg mb-6 text-gray-200">
            Join Predictify today and test your football knowledge in leagues with your mates.
          </p>
          <Link href="/auth">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition">
              Get Started
            </button>
          </Link>
        </section>

        {/* Features */}
        <section className="py-12 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-300">Real Fixtures</h3>
              <p className="text-gray-300">Premier League matches updated automatically each week.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-300">Leagues with Friends</h3>
              <p className="text-gray-300">Create or join leagues to compete against your mates.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2 text-yellow-300">Earn Points</h3>
              <p className="text-gray-300">Predict correctly to climb the leaderboard and earn bragging rights.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm py-6 text-gray-400">
          &copy; {new Date().getFullYear()} Predictify. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

// 🔒 Keep users logged in
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    props: {
      initialSession: session,
      user: session?.user ?? null,
    },
  };
};
