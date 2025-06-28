// pages/dashboard.js

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import Link from 'next/link';
import { useUser } from '@supabase/auth-helpers-react';

export default function UserDashboard() {
  const user = useUser();
  const [points, setPoints] = useState(0);
  const [leagues, setLeagues] = useState([]);
  const [publicLeagues, setPublicLeagues] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [recentResults, setRecentResults] = useState([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);

  useEffect(() => {
    if (!user) return;
    fetchUserLeagues();
  }, [user]);

  const fetchUserLeagues = async () => {
    setError('');
    try {
      // Fetch league memberships
      const { data: memberships, error: memberError } = await supabase
        .from('league_members')
        .select('league_id')
        .eq('user_id', user.id);

      if (memberError) {
        console.error('League member error:', memberError);
        setError('Failed to fetch league memberships');
        return;
      }

      const leagueIds = memberships.map(m => m.league_id);

      // Fetch league details
      const { data: userLeagues, error: leaguesError } = await supabase
        .from('leagues')
        .select('id, name, is_public, invite_code')
        .in('id', leagueIds);

      if (leaguesError) {
        console.error('Leagues fetch error:', leaguesError);
        setError('Failed to fetch leagues');
        return;
      }

      setLeagues(userLeagues || []);

      // Fetch user points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      setPoints(pointsData?.total_points || 0);

      // Fetch public leagues
      const { data: publicData } = await supabase
        .from('leagues')
        .select()
        .eq('is_public', true);

      setPublicLeagues(publicData || []);

      // Fetch recent results
      const { data: results } = await supabase
        .from('predictions')
        .select('fixtures(home_team, away_team, actual_home_score, actual_away_score), predicted_home_score, predicted_away_score')
        .eq('user_id', user.id)
        .not('fixtures.actual_home_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentResults(results || []);

      // Fetch upcoming fixtures
      const { data: fixtures } = await supabase
        .from('fixtures')
        .select()
        .gt('match_date', new Date().toISOString())
        .order('match_date')
        .limit(5);

      setUpcomingFixtures(fixtures || []);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Unexpected error occurred');
    }
  };

  const joinLeague = async () => {
    await supabase.rpc('join_league_by_code', {
      user_id_input: user.id,
      invite_code_input: inviteCode,
    });
    setInviteCode('');
    fetchUserLeagues();
  };

  const leaveLeague = async (leagueId) => {
    await supabase
      .from('league_members')
      .delete()
      .match({ user_id: user.id, league_id: leagueId });

    fetchUserLeagues();
  };

  const createLeague = async () => {
    setError('');
    setSuccessMessage('');

    if (!newLeagueName.trim()) {
      setError('Please enter a league name.');
      return;
    }

    const code = isPublic ? null : Math.random().toString(36).substr(2, 8).toUpperCase();

    const { data: leagueData, error: leagueError } = await supabase
      .from('leagues')
      .insert([
        {
          name: newLeagueName,
          is_public: isPublic,
          invite_code: code,
          creator_id: user.id,
        },
      ])
      .select()
      .single();

    if (leagueError) {
      console.error('League creation error:', leagueError);
      setError('Failed to create league: ' + leagueError.message);
      return;
    }

    const { error: memberError } = await supabase
      .from('league_members')
      .insert([{ league_id: leagueData.id, user_id: user.id }]);

    if (memberError) {
      console.error('League member join error:', memberError);
      setError('League created, but failed to join: ' + memberError.message);
      return;
    }

    setNewLeagueName('');
    setIsPublic(false);
    setSuccessMessage(`League "${leagueData.name}" created! ${code ? 'Invite code: ' + code : ''}`);
    fetchUserLeagues();
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Welcome!</h1>
      <p className="mb-2 text-xs text-gray-400">User ID: {user?.id}</p>
      <p className="mb-4">Total Points: <strong>{points}</strong></p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Leagues</h2>
      <ul className="mb-4">
        {leagues.map(league => (
          <li key={league.id} className="flex justify-between items-center border-b py-2">
            <div>
              <span className="font-semibold">{league.name}</span>
              {!league.is_public && league.invite_code && (
                <span className="ml-2 text-xs text-gray-500">Invite Code: {league.invite_code}</span>
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
          onChange={e => setInviteCode(e.target.value)}
          placeholder="Enter invite code"
          className="border px-2 py-1 mr-2"
        />
        <button onClick={joinLeague} className="bg-blue-500 text-white px-4 py-1 rounded">Join</button>
      </div>

      <div className="mb-6 border p-4 rounded bg-gray-800 text-white">
        <h3 className="text-lg font-semibold mb-2">Create New League</h3>
        {successMessage && <p className="text-green-400 mb-2">{successMessage}</p>}
        {error && <p className="text-red-400 mb-2">{error}</p>}
        <input
          type="text"
          value={newLeagueName}
          onChange={e => setNewLeagueName(e.target.value)}
          placeholder="League name"
          className="border px-2 py-1 w-full mb-2 text-black"
        />
        <label className="flex items-center space-x-2 mb-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
          />
          <span>Make this league public</span>
        </label>
        <button
          onClick={createLeague}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Create League
        </button>
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

      <Link href="/predictions" className="block text-center bg-blue-700 text-white px-4 py-2 rounded">
        Go to Predictions
      </Link>
    </div>
  );
            }
