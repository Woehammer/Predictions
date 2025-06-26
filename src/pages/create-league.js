import { useState } from 'react'; import { supabase } from '@/lib/supabaseclient'; import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default function CreateLeague({ user }) { const [name, setName] = useState(''); const [isPublic, setIsPublic] = useState(true); const [inviteCode, setInviteCode] = useState(''); const [message, setMessage] = useState('');

const handleSubmit = async (e) => { e.preventDefault();

if (!name.trim()) {
  setMessage('League name is required.');
  return;
}

const { data, error } = await supabase.from('leagues').insert({
  name,
  is_public: isPublic,
  invite_code: isPublic ? null : inviteCode || crypto.randomUUID(),
  created_by: user.id,
}).select().single();

if (error) {
  console.error(error);
  setMessage('Error creating league.');
} else {
  // Auto-join the user to their created league
  await supabase.from('league_members').insert({
    user_id: user.id,
    league_id: data.id,
  });
  setMessage('League created successfully!');
  setName('');
  setInviteCode('');
}

};

return ( <div className="p-4 max-w-xl mx-auto"> <h1 className="text-2xl font-bold mb-4">Create a New League</h1> {message && <p className="mb-4 text-green-600">{message}</p>}

<form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label className="block font-medium">League Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />
    </div>

    <div>
      <label className="block font-medium">League Visibility</label>
      <select
        value={isPublic ? 'public' : 'private'}
        onChange={(e) => setIsPublic(e.target.value === 'public')}
        className="w-full border p-2 rounded"
      >
        <option value="public">Public</option>
        <option value="private">Private (Invite Code Required)</option>
      </select>
    </div>

    {!isPublic && (
      <div>
        <label className="block font-medium">Invite Code (optional)</label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <p className="text-sm text-gray-500">Leave blank to auto-generate a code.</p>
      </div>
    )}

    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Create League
    </button>
  </form>
</div>

); }

export async function getServerSideProps(ctx) { const supabase = createServerSupabaseClient(ctx); const { data: { user }, } = await supabase.auth.getUser();

if (!user) { return { redirect: { destination: '/auth/login', permanent: false, }, }; }

return { props: { user }, }; }

