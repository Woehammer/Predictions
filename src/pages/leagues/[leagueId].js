// pages/leagues/[leagueId].js import React, { useEffect, useState } from 'react'; import { useUser } from '@supabase/auth-helpers-react'; import { useRouter } from 'next/router'; import { supabase } from '@/lib/supabaseclient';

export default function LeaguePage() { const router = useRouter(); const { leagueId } = router.query; const user = useUser();

const [members, setMembers] = useState([]); const [leagueName, setLeagueName] = useState(''); const [hasChat, setHasChat] = useState(true); const [messages, setMessages] = useState([]); const [newMessage, setNewMessage] = useState(''); const [honours, setHonours] = useState([]); const [userStats, setUserStats] = useState({});

const [currentPage, setCurrentPage] = useState(0); const itemsPerPage = 50;

useEffect(() => { if (leagueId) { fetchLeaderboard(); fetchHonours(); fetchUserStats(); if (hasChat) fetchMessages(); } }, [leagueId]);

const fetchLeaderboard = async () => { const { data: leagueMembers, error: memberError } = await supabase .from('league_members') .select('user_id') .eq('league_id', leagueId);

if (memberError) {
  console.error('Error fetching league members:', memberError);
  return;
}

const userIds = leagueMembers.map((m) => m.user_id);

const { data: profiles } = await supabase
  .from('profiles')
  .select('id, username')
  .in('id', userIds);

const { data: scores } = await supabase
  .from('league_scores_view')
  .select('*')
  .eq('league_id', leagueId);

const scoresById = {};
for (const s of scores || []) {
  scoresById[s.user_id] = s;
}

const combined = profiles.map((p) => {
  const s = scoresById[p.id] || {
    overall_score: 0,
    month_score: 0,
    week_score: 0,
    last_week_score: 0,
  };
  return {
    user_id: p.id,
    username: p.username ?? p.id.slice(0, 6),
    ...s,
  };
});

const sorted = combined.sort((a, b) => b.overall_score - a.overall_score);
setMembers(sorted);

const { data: leagueData } = await supabase
  .from('leagues')
  .select('name, has_chat')
  .eq('id', leagueId)
  .single();

if (leagueData) {
  setLeagueName(leagueData.name);
  setHasChat(leagueData.has_chat !== false);
}

};

const fetchUserStats = async () => { const { data, error } = await supabase .from('user_prediction_stats_view') .select('*') .eq('league_id', leagueId);

if (!error) {
  const statMap = {};
  for (const row of data) {
    statMap[row.user_id] = row;
  }
  setUserStats(statMap);
}

};

const fetchHonours = async () => { const { data, error } = await supabase .from('monthly_honours_view') .select('month_label, username, month_points') .eq('league_id', leagueId) .order('month_start', { ascending: false }) .limit(6);

if (!error) setHonours(data);

};

const fetchMessages = async () => { const { data, error } = await supabase .from('league_messages') .select('message, created_at, user_id, profiles ( username )') .eq('league_id', leagueId) .order('created_at', { ascending: true });

if (!error) setMessages(data);

};

const sendMessage = async () => { if (!newMessage.trim()) return;

const { error } = await supabase.from('league_messages').insert({
  league_id: leagueId,
  user_id: user.id,
  message: newMessage.trim(),
});

if (!error) {
  setNewMessage('');
  fetchMessages();
}

};

function getPercent(part, total) { if (!total || total === 0) return 0; return Math.round((part / total) * 100); }

if (!leagueId) return <p className="p-4">Loading...</p>;

const pageMembers = members.slice( currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage );

return ( <div className="p-4 max-w-4xl mx-auto"> <h1 className="text-2xl font-bold mb-4">League: {leagueName || 'Loading...'}</h1>

<h2 className="text-xl font-semibold mb-2">Leaderboard</h2>

  <div className="flex justify-between mt-2 mb-4">
    <button
      onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
      disabled={currentPage === 0}
      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    >
      Previous
    </button>
    <button
      onClick={() => setCurrentPage((p) => (p + 1) * itemsPerPage < members.length ? p + 1 : p)}
      disabled={(currentPage + 1) * itemsPerPage >= members.length}
      className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>

  {/* Include your full table and mobile views here, but use pageMembers.map(...) instead of members.map(...) */}

  <h2 className="text-xl font-semibold mb-2 mt-6">Roll of Honour</h2>
  {honours.length === 0 ? (
    <p className="text-gray-500 mb-6">No monthly winners yet.</p>
  ) : (
    <ul className="mb-6 border rounded divide-y">
      {honours.map((h, i) => (
        <li key={i} className="px-4 py-2">
          <div className="flex justify-between w-full">
            <span className="font-medium">{h.month_label.trim()}</span>
            <span>{h.username} ({h.month_points} pts)</span>
          </div>
        </li>
      ))}
    </ul>
  )}

  {hasChat && (
    <>
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
    </>
  )}
</div>

); }

