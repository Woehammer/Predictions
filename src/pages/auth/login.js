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
          className="bg-blue-600 text-white p-2 w-full rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
