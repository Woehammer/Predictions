import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseclient';

export default function CreateLeague() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leagueName, setLeagueName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!leagueName.trim()) {
      setError('League name is required');
      return;
    }

    const inviteCode = isPublic ? null : generateInviteCode();

    const { data, error } = await supabase
      .from('leagues')
      .insert([{
        name: leagueName,
        is_public: isPublic,
        invite_code: inviteCode
      }])
      .select()
      .single();

  if (error) {
  console.error('Supabase error:', error);
  setError(`Failed to create league: ${error.message}`);
  return;
  }

    await supabase.from('league_members').insert([
      {
        league_id: data.id,
        user_id: user.id
      }
    ]);

    setSuccess(`League created${inviteCode ? ` with invite code: ${inviteCode}` : ''}`);
    setLeagueName('');
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New League</h1>

      {success && <p className="text-green-600 mb-4">{success}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          League Name
          <input
            type="text"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            className="border w-full px-3 py-2 mt-1"
            required
          />
        </label>

        <label className="block mb-4">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          Public League
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create League
        </button>
      </form>
    </div>
  );
      }
