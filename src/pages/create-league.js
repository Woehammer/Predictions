import { useState } from 'react'; import { useRouter } from 'next/router'; import { supabase } from '../lib/supabaseclient'; import { useUser } from '@supabase/auth-helpers-react';

export default function CreateLeague() { const router = useRouter(); const user = useUser(); const [name, setName] = useState(''); const [isPublic, setIsPublic] = useState(true); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [successMessage, setSuccessMessage] = useState(''); const [inviteCode, setInviteCode] = useState('');

const handleCreate = async (e) => { e.preventDefault(); setError(''); setSuccessMessage('');

if (name.length < 3 || name.length > 50) {
  setError('League name must be between 3 and 50 characters.');
  return;
}

setLoading(true);

try {
  const code = isPublic ? null : Math.random().toString(36).substr(2, 8).toUpperCase();
  setInviteCode(code);

  const { data: league, error: leagueError } = await supabase
    .from('leagues')
    .insert([{ name, is_public: isPublic, invite_code: code }])
    .select()
    .single();

  if (leagueError) throw leagueError;

  const { error: memberError } = await supabase
    .from('league_members')
    .insert([{ user_id: user.id, league_id: league.id }]);

  if (memberError) throw memberError;

  setSuccessMessage(`League "${name}" created successfully!${!isPublic ? ` Invite Code: ${code}` : ''}`);
  setTimeout(() => router.push('/dashboard'), 3000);
} catch (err) {
  setError(err.message);
}

setLoading(false);

};

return ( <div className="p-4 max-w-md mx-auto"> <h1 className="text-2xl font-bold mb-4">Create a New League</h1> <form onSubmit={handleCreate} className="space-y-4"> <div> <label className="block mb-1 font-medium">League Name</label> <input type="text" className="w-full border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required minLength={3} maxLength={50} /> </div>

<div>
      <label className="block mb-1 font-medium">Visibility</label>
      <select
        className="w-full border px-3 py-2"
        value={isPublic ? 'public' : 'private'}
        onChange={(e) => setIsPublic(e.target.value === 'public')}
      >
        <option value="public">Public (anyone can join)</option>
        <option value="private">Private (invite code required)</option>
      </select>
    </div>

    {error && <p className="text-red-600 text-sm">{error}</p>}
    {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

    <button
      type="submit"
      className="w-full bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      disabled={loading}
    >
      {loading ? 'Creating...' : 'Create League'}
    </button>
  </form>
</div>

); }

