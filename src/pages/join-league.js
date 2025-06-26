// File: src/pages/join-league.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

export default function JoinLeague() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleJoin = async () => {
    if (!user) {
      setMessage('You must be logged in to join a league.');
      return;
    }

    const { data: league, error } = await supabase
      .from('leagues')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();

    if (error || !league) {
      setMessage('Invalid invite code.');
      return;
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', league.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      setMessage('You are already a member of this league.');
      return;
    }

    // Insert into league_members
    const { error: insertError } = await supabase.from('league_members').insert([
      { user_id: user.id, league_id: league.id },
    ]);

    if (insertError) {
      setMessage('Failed to join league.');
    } else {
      setMessage(`Successfully joined league: ${league.name}`);
      setTimeout(() => router.push('/leagues'), 2000);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Join a League</h1>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Enter invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleJoin}
      >
        Join League
      </button>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
}
