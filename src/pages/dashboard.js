import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Link from 'next/link';
import { useSession } from '@supabase/auth-helpers-react';

export default function UserDashboard() {
  const session = useSession();
  const user = session?.user;

  const [points, setPoints] = useState(0);
  const [username, setUsername] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [publicLeagues, setPublicLeagues] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [recentResults, setRecentResults] = useState([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setUsername(profile?.username || '');

      const { data: memberships } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id);

      const leagueIds = memberships?.map((m) => m.league_id) || [];

      const { data: userLeagues } = await supabase
        .from('leagues')
        .select('id, name, is_public, invite_code')
        .in('id', leagueIds);

      setLeagues(userLeagues || []);

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
  }, [user]);

  const joinLeague = async () => {
    if (!inviteCode.trim()) return;

    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('id, name, is_public, invite_code')
      .eq('invite_code', inviteCode.trim())
      .single();

    if (leagueError || !league) {
      setError('League not found.');
      return;
    }

    const { data: existing } = await supabase
      .from('league_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('league_id', league.id)
      .single();

    if (existing) {
      setError('You are already a member of this league.');
      return;
    }

    const { error: insertError } = await supabase
      .from('league_members')
      .insert({ user_id: user.id, league_id: league.id });

    if (insertError) {
      setError('Failed to join league.');
      return;
    }

    setSuccessMessage('Successfully joined the league!');
    setInviteCode('');

    const { data: updatedLeagues } = await supabase
      .from('leagues')
      .select('id, name, is_public, invite_code')
      .in('id', [...leagues.map((l) => l.id), league.id]);

    setLeagues(updatedLeagues || []);
  };

  const leaveLeague = async (leagueId) => {
    await supabase
      .from('league_members')
      .delete()
      .match({ user_id: user.id, league_id: leagueId });

    setLeagues(leagues.filter((l) => l.id !== leagueId));
  };

  const createLeague = async () => {
    setError('');
    setSuccessMessage('');
    if (!newLeagueName.trim()) {
      setError('Please enter a league name.');
      return;
    }

    const { data, error } = await supabase
      .from('leagues')
      .insert([
        {
          name: newLeagueName,
          is_public: false,
          invite_code: null,
          creator_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      setError('Failed to create league.');
      return;
    }

    const newLeague = data;

    const { error: memberError } = await supabase
      .from('league_members')
      .insert([{ league_id: newLeague.id, user_id: user.id }]);

    if (memberError) {
      setError('League created, but failed to join.');
      return;
    }

    setNewLeagueName('');
    setSuccessMessage(`League "${newLeague.name}" created!`);
    setLeagues((prev) => [...prev, newLeague]);
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Welcome, {username || 'User'}!</h1>
      <p className="mb-4">Total Points: <strong>{points}</strong></p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Profile</h2>
      <p className="mb-4">
        Manage your profile on the{' '}
        <Link href="/profile" className="text-blue-500 underline hover:text-blue-700">
          Profile Page
        </Link>.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Leagues</h2>
      <ul className="mb-4">
        {leagues.map((league) => (
          <li key={league.id} className="flex justify-between items-center border-b py-2">
            <div>
              <Link href={`/leagues/${league.id}`} className="text-blue-500 underline hover:text-blue-700">
                {league.name}
              </Link>
              {!league.is_public && league.invite_code && (
                <span className="ml-2 text-xs text-gray-400">Invite Code: {league.invite_code}</span>
              )}
            </div>
            <button onClick={() => leaveLeague(league.id)} className="text-red-500 text-sm">Leave</button>
          </li>
        ))}
      </ul>

      <div className="mb-6">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
          className="border px-2 py-1 mr-2 bg-white dark:bg-gray-900 text-black dark:text-white"
        />
        <button onClick={joinLeague} className="bg-blue-500 text-white px-4 py-1 rounded">Join</button>
      </div>

      <div className="mb-6 border p-4 rounded bg-gray-100 dark:bg-gray-800">
        <h3 className="text-lg font-semibold mb-2">Create New League</h3>
        {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          value={newLeagueName}
          onChange={(e) => setNewLeagueName(e.target.value)}
          placeholder="League name"
          className="border px-2 py-1 w-full mb-2 bg-white dark:bg-gray-900 text-black dark:text-white"
        />
        <button onClick={createLeague} className="bg-green-600 text-white px-4 py-2 rounded w-full">Create League</button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Public Leagues</h2>
      <ul className="mb-6">
        {publicLeagues.map((league) => (
          <li key={league.id} className="border-b py-2">{league.name}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Recent Results</h2>
      <ul className="mb-6">
        {recentResults.map((result, index) => (
          <li key={index} className="text-sm border-b py-2">
            {result.fixtures.home_team} {result.predicted_home_score}–
            {result.predicted_away_score} vs actual{' '}
            {result.fixtures.actual_home_score}–
            {result.fixtures.actual_away_score} {result.fixtures.away_team}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Upcoming Fixtures</h2>
      <ul className="mb-6">
        {upcomingFixtures.map((f) => (
          <li key={f.id} className="text-sm border-b py-2">
            {f.home_team} vs {f.away_team} — {new Date(f.match_date).toLocaleString()}
          </li>
        ))}
      </ul>

      <Link href="/predictions" className="block text-center bg-blue-700 text-white px-4 py-2 rounded">
        Go to Predictions
      </Link>
    </div>
  );
    }
