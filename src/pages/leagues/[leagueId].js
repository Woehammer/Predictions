import React, { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseclient';

export default function LeaguePage() {
  const router = useRouter();
  const { leagueId } = router.query;
  const user = useUser();

  const [members, setMembers] = useState([]);
  const [leagueName, setLeagueName] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (leagueId) {
      fetchLeaderboard();
      fetchMessages();
    }
  }, [leagueId]);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('league_members')
      .select(`
        user_id,
        profiles ( username ),
        user_points ( total_points )
      `)
      .eq('league_id', leagueId);

    if (error) {
      console.error('Leaderboard error:', error);
    } else {
      setMembers(data);

      // Fetch league name separately
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('name')
        .eq('id', leagueId)
        .single();

      if (!leagueError) setLeagueName(leagueData?.name || '');
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('league_messages')
      .select(`
        message,
        created_at,
        user_id,
        profiles ( username )
      `)
      .eq('league_id', leagueId)
      .order('created_at', { ascending: true });

    if (error) console.error('Message fetch error:', error);
    else setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('league_messages').insert({
      league_id: leagueId,
      user_id: user.id,
      message: newMessage.trim(),
    });

    if (error) console.error('Send error:', error);
    else {
      setNewMessage('');
      fetchMessages();
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">League: {leagueName}</h1>

      <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
      <ul className="mb-6 border rounded">
        {members.map((m, i) => (
          <li
            key={m.user_id}
            className="border-b px-4 py-2 flex justify-between items-center"
          >
            <span>
              {i + 1}. {m.profiles?.username || m.user_id.slice(0, 6)}
            </span>
            <span className="text-blue-600 font-semibold">
              {m.user_points?.total_points ?? 0} pts
            </span>
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2">Chat</h2>
      <div className="border rounded h-64 overflow-y-auto p-2 mb-2 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="text-sm text-gray-600">
              {msg.profiles?.username || msg.user_id.slice(0, 6)}:
            </span>{' '}
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="border rounded p-1 flex-1"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
