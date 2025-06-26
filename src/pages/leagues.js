// pages/leagues.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';
import { v4 as uuidv4 } from 'uuid';

export default function Leagues() {
  const [user, setUser] = useState(null);
  const [leagues, setLeagues] = useState([]);
  const [members, setMembers] = useState({});
  const [newLeagueName, setNewLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error.message);
      } else {
        console.log('Fetched user:', data.user);
        setUser(data.user);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Triggering fetchLeagues for user:', user.id);
      fetchLeagues();
    }
  }, [user]);

  const fetchLeagues = async () => {
    const { data, error } = await supabase
      .from('league_members')
      .select('leagues!league_id(id, name, invite_code)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching leagues:', error);
    } else {
      console.log('League fetch result:', data);
      const leagueList = data.map((d) => d.leagues);
      setLeagues(leagueList);
      fetchMembers(leagueList);
    }
  };

  const fetchMembers = async (leagueList) => {
    const leagueIds = leagueList.map((l) => l.id);
    const { data, error } = await supabase
      .from('league_members')
      .select('league_id, users(username, email)')
      .in('league_id', leagueIds);

    if (error) {
      console.error('Error fetching members:', error.message);
    } else {
      const grouped = {};
      data.forEach((entry) => {
        if (!grouped[entry.league_id]) grouped[entry.league_id] = [];
        grouped[entry.league_id].push(entry.users);
      });
      setMembers(grouped);
    }
  };

  const createLeague = async () => {
    const invite_code = uuidv4().split('-')[0];
    const { data, error } = await supabase
      .from('leagues')
      .insert({
        name: newLeagueName,
        creator_id: user.id,
        invite_code,
      })
      .select();

    if (error) {
      console.error('Error creating league:', error.message);
      return;
    }

    if (data && data.length > 0) {
      await supabase.from('league_members').insert({
        league_id: data[0].id,
        user_id: user.id,
      });
      setNewLeagueName('');
      fetchLeagues();
    }
  };

  const joinLeague = async () => {
    const { data, error } = await supabase
      .from('leagues')
      .select('id')
      .eq('invite_code', joinCode)
      .single();

    if (error) {
      console.error('Error finding league with code:', joinCode, error.message);
      return;
    }

    await supabase.from('league_members').insert({
      league_id: data.id,
      user_id: user.id,
    });

    setJoinCode('');
    fetchLeagues();
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Leagues</h1>

      {leagues.length === 0 && <p>You haven’t joined or created any leagues.</p>}

      <ul className="mb-6">
        {leagues.map((l) => (
          <li key={l.id} className="mb-4 border p-3 rounded">
            <div className="font-bold">{l.name}</div>
            <div className="text-sm text-gray-500 mb-1">
              Invite Code: <code>{l.invite_code}</code>
            </div>
            <div className="text-sm font-semibold">Members:</div>
            <ul className="pl-4 list-disc text-sm">
              {(members[l.id] || []).map((m) => (
                <li key={m.email}>{m.username || m.email}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <input
          className="border p-2 w-full mb-2"
          placeholder="New League Name"
          value={newLeagueName}
          onChange={(e) => setNewLeagueName(e.target.value)}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={createLeague}
        >
          Create League
        </button>
      </div>

      <div>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Enter Invite Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          onClick={joinLeague}
        >
          Join League
        </button>
      </div>
    </div>
  );
        }
