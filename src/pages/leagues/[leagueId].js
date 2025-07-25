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
      .from('league_scores_view')
      .select('user_id, username, overall_score, month_score, week_score, last_week_score')
      .eq('league_id', leagueId)
      .order('overall_score', { ascending: false });

    if (error) {
      console.error('Leaderboard error:', error);
      return;
    }

    setMembers(data);

    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .select('name')
      .eq('id', leagueId)
      .single();

    if (!leagueError) setLeagueName(leagueData?.name || '');
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

    if (error) {
      console.error('Send error:', error);
    } else {
      setNewMessage('');
      fetchMessages();
    }
  };

  if (!leagueId) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">League: {leagueName || 'Loading...'}</h1>

      <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
      {members.length === 0 ? (
        <p className="text-gray-500 mb-4">No members found.</p>
      ) : (
        <div className="mb-6 border rounded overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-center">Overall</th>
                <th className="px-4 py-2 text-center">This Month</th>
                <th className="px-4 py-2 text-center">This Week</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const diff = m.week_score - m.last_week_score;
                const diffColor =
                  diff > 0
                    ? 'text-green-600'
                    : diff < 0
                    ? 'text-red-500'
                    : 'text-gray-400';

                return (
                  <tr
                    key={m.user_id}
                    className={`border-t ${
                      user?.id === m.user_id ? 'bg-yellow-100 dark:bg-yellow-900' : ''
                    }`}
                  >
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{m.username}</td>
                    <td className="px-4 py-2 text-center">{m.overall_score}</td>
                    <td className="px-4 py-2 text-center">{m.month_score}</td>
                    <td className="px-4 py-2 text-center">
                      <span title={`Last week: ${m.last_week_score}`}>
                        {m.week_score}{' '}
                        <span className={`text-sm ${diffColor}`}>
                          ({diff > 0 ? '+' : ''}{diff})
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Chat</h2>
      <div className="border rounded h-64 overflow-y-auto p-2 mb-2 bg-white dark:bg-gray-900">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">
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
