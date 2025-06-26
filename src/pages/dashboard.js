import { useEffect, useState } from 'react'; import { supabase } from '@/utils/supabaseClient'; import Link from 'next/link';

export default function UserDashboard({ user }) { const [points, setPoints] = useState(0); const [leagues, setLeagues] = useState([]); const [publicLeagues, setPublicLeagues] = useState([]); const [inviteCode, setInviteCode] = useState(''); const [recentResults, setRecentResults] = useState([]); const [upcomingFixtures, setUpcomingFixtures] = useState([]);

useEffect(() => { const fetchData = async () => { const { data: userLeagues } = await supabase .from('league_members') .select('leagues(id, name, is_public)') .eq('user_id', user.id);

setLeagues(userLeagues?.map(l => l.leagues) || []);

  const { data: pointsData } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', user.id)
    .single();
  setPoints(pointsData?.total_points || 0);

  const { data: publicData } = await supabase
    .from('leagues')
    .select()
    .eq('is_public', true);
  setPublicLeagues(publicData || []);

  const { data: results } = await supabase
    .from('predictions')
    .select('fixtures(home_team, away_team, actual_home_score, actual_away_score), predicted_home_score, predicted_away_score')
    .eq('user_id', user.id)
    .not('fixtures.actual_home_score', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
  setRecentResults(results || []);

  const { data: fixtures } = await supabase
    .from('fixtures')
    .select()
    .gt('match_date', new Date().toISOString())
    .order('match_date')
    .limit(5);
  setUpcomingFixtures(fixtures || []);
};

fetchData();

}, [user.id]);

const joinLeague = async () => { await supabase.rpc('join_league_by_code', { user_id_input: user.id, invite_code_input: inviteCode, }); setInviteCode(''); };

const leaveLeague = async (leagueId) => { await supabase .from('league_members') .delete() .match({ user_id: user.id, league_id: leagueId }); setLeagues(leagues.filter(l => l.id !== leagueId)); };

return ( <div className="p-4 max-w-3xl mx-auto"> <h1 className="text-2xl font-bold mb-4">Welcome!</h1> <p className="mb-4">Total Points: <strong>{points}</strong></p>

<h2 className="text-xl font-semibold mt-6 mb-2">Your Leagues</h2>
  <ul className="mb-4">
    {leagues.map(league => (
      <li key={league.id} className="flex justify-between items-center border-b py-2">
        <span>{league.name}</span>
        <button onClick={() => leaveLeague(league.id)} className="text-red-500 text-sm">Leave</button>
      </li>
    ))}
  </ul>

  <div className="mb-6">
    <input
      type="text"
      value={inviteCode}
      onChange={e => setInviteCode(e.target.value)}
      placeholder="Enter invite code"
      className="border px-2 py-1 mr-2"
    />
    <button onClick={joinLeague} className="bg-blue-500 text-white px-4 py-1 rounded">Join</button>
    <Link href="/create-league" className="ml-4 text-blue-600 underline">Create New League</Link>
  </div>

  <h2 className="text-xl font-semibold mt-6 mb-2">Public Leagues</h2>
  <ul className="mb-6">
    {publicLeagues.map(league => (
      <li key={league.id} className="border-b py-2">
        {league.name}
      </li>
    ))}
  </ul>

  <h2 className="text-xl font-semibold mt-6 mb-2">Recent Results</h2>
  <ul className="mb-6">
    {recentResults.map((result, index) => (
      <li key={index} className="text-sm border-b py-2">
        {result.fixtures.home_team} {result.predicted_home_score}–{result.predicted_away_score} vs actual {result.fixtures.actual_home_score}–{result.fixtures.actual_away_score} {result.fixtures.away_team}
      </li>
    ))}
  </ul>

  <h2 className="text-xl font-semibold mt-6 mb-2">Upcoming Fixtures</h2>
  <ul className="mb-6">
    {upcomingFixtures.map(f => (
      <li key={f.id} className="text-sm border-b py-2">
        {f.home_team} vs {f.away_team} — {new Date(f.match_date).toLocaleString()}
      </li>
    ))}
  </ul>

  <Link href="/predictions" className="block text-center bg-green-600 text-white px-4 py-2 rounded">Go to Predictions</Link>
</div>

); }

