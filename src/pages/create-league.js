import { useState } from 'react';
import { supabase } from '@/lib/supabaseclient';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';

export default function CreateLeague() {
  const user = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('League name is required.');
      return;
    }

    const code = isPublic ? null : Math.random().toString(36).substr(2, 8).toUpperCase();

    const { data, error } = await supabase
      .from('leagues')
      .insert([{ name, is_public: isPublic, invite_code: code, owner_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error(error);
      setError('Failed to create league.');
      return;
    }

    const newLeague = data;

    // Add the user as a league member
    const { error: memberError } = await supabase.from('league_members').insert([
      { user_id: user.id, league_id: newLeague.id }
    ]);

    if (memberError) {
      console.error(memberError);
      setError('League created, but failed to join.');
      return;
    }

    setInviteCode(code);
    setSuccess(true);
    setError(false);
    setName('');
  };

  if (!user) {
    return <p className="p-4">Please log in to create a league.</p>;
  }

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create a New League</h1>

      {success && (
        <div className="mb-4 text-green-700 bg-green-100 border border-green-300 p-2 rounded">
          League created successfully!
          {!isPublic && inviteCode && (
            <p className="mt-2">Invite Code: <strong>{inviteCode}</strong></p>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">League Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            placeholder="e.g. Fantasy Premier League"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            id="public"
          />
          <label htmlFor="public" className="text-sm">Make this league public</label>
        </div>

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
