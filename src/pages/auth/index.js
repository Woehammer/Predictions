import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseclient';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleEmailAuth = async () => {
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(`${isSignup ? 'Signup' : 'Login'} failed: ${error.message}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert('Google sign-in failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/stadium-bg_20250725_183319_0000.jpg')] bg-cover bg-center text-white">
      <div className="min-h-screen flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-black/80 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isSignup ? 'Sign Up' : 'Login to Predictify'}
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="border p-2 w-full mb-4 rounded bg-white text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full mb-6 rounded bg-white text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 w-full rounded mb-4"
            onClick={handleEmailAuth}
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>

          <div className="text-center text-gray-300 my-2">or</div>

          <button
            className="bg-red-600 hover:bg-red-700 text-white font-semibold p-2 w-full rounded mb-6"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-300">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              className="text-yellow-400 underline hover:text-yellow-300"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
