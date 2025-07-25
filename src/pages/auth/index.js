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
      alert((isSignup ? 'Signup' : 'Login') + ' failed: ' + error.message);
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
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">{isSignup ? 'Sign Up' : 'Login'}</h1>

      <input
        type="email"
        placeholder="Email"
        className="border p-2 block w-full mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2 block w-full mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white p-2 w-full rounded mb-4"
        onClick={handleEmailAuth}
      >
        {isSignup ? 'Sign Up' : 'Login'}
      </button>

      <div className="text-center my-2 text-gray-500">or</div>

      <button
        className="bg-red-600 text-white p-2 w-full rounded mb-4"
        onClick={handleGoogleLogin}
      >
        Continue with Google
      </button>

      <p className="text-center text-sm">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          className="text-blue-500 underline"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
