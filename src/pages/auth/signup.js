import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseclient';
// import Header from '../../components/Header'; // optional

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert('Signup failed: ' + error.message);
    } else {
      alert('Signup successful! Please check your email to confirm.');
      router.push('/auth/login');
    }
  };

  return (
    <div>
      {/* <Header /> */}
      <div className="p-4 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Sign Up</h1>
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
          className="bg-green-600 text-white p-2 w-full rounded"
          onClick={handleSignup}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
