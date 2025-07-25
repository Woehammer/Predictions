import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseclient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login failed: ' + error.message);
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
      alert('Google login failed: ' + error.message);
    }
  };

  return (
    <div>
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Login</h1>
        
        <input
          type="email"
          placeholder="Email"
          className="border p-2 block w-full mb-2"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 block w-full mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white p-2 w-full rounded mb-4"
          onClick={handleLogin}
        >
          Login
        </button>

        <div className="text-center my-2 text-gray-500">or</div>

        <button
          className="bg-red-600 text-white p-2 w-full rounded"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
