import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';
import Header from './Header';

export default function LeagueDashboard() {
  const [leagues, setLeagues] = useState([]);
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState({});

  useEffect(() => {
    const fetchUserAndLeagues = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('leagues')
          .select('id, name, invite_code')
          .in('id',
            supabase
              .from('league_members')
              .select('league_id', { count: 'exact' })
              .eq('user_id', user.id)
          );

        if (!error) setLeagues(data);
      }
    };

    fetchUserAndLeagues();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!leagues.length) return;

      const leagueIds = leagues.map(l => l.id);
      const { data, error } = await supabase
        .from('league_members')
        .select('league_id, users (id, email)')
        .in('league_id', leagueIds);

      if (!error) {
        const grouped = {};
        data.forEach(row => {
          if (!grouped[row.league_id]) grouped[row.league_id] = [];
          grouped[row.league_id].push(row.users);
        });
        setMembers(grouped);
      }
    };

    fetchMembers();
  }, [leagues]);

  return (
    <div>
      <Header />
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Your Leagues</h1>
        {leagues.map(league => (
          <div key={league.id} className="mb-6 border p-4 rounded shadow">
            <h2 className="font-bold text-lg">{league.name}</h2>
            <p className="text-sm text-gray-600">Invite Code: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{league.invite_code}</span></p>
            <h3 className="mt-4 font-semibold">Members:</h3>
            <ul className="list-disc ml-6">
              {(members[league.id] || []).map(member => (
                <li key={member.id}>{member.email}</li>
              ))}
            </ul>
          </div>
        ))}
        {leagues.length === 0 && <p>You are not in any leagues.</p>}
      </div>
    </div>
  );
}
