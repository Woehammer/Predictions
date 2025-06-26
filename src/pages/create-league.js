import { useState } from 'react';
import { supabase } from '../lib/supabaseclient';
import { useRouter } from 'next/router';

export default function CreateLeague({ user }) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null;
  }

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('League name is required.');
      return;
    }

    const { data, error: insertError } = await supabase.from('leagues').insert([
      {
        name,
        is_public: isPublic,
        invite_code: isPublic ? null : inviteCode || null,
        created_by: user.id,
      },
    ]).select().single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // Add the user to the league as a member
    await supabase.from('league_members').insert([
      { user_id: user.id, league_id: data.id },
    ]);

    setSuccess('League created successfully!');
    setName('');
    setInviteCode('');
    setError('');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create League</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">League Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border px-3 py-2 w-full"
            required
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={() => setIsPublic(!isPublic)}
            className="mr-2"
          />
          <label>Public League</label>
        </div>

        {!isPublic && (
          <div className="mb-4">
            <label className="block font-semibold mb-1">Invite Code (optional)</label>
            <div className="flex">
              <input
                type="text"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                className="border px-3 py-2 flex-grow"
              />
              <button type="button" onClick={generateCode} className="ml-2 px-3 py-2 bg-gray-200">Generate</button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-600 mt-2">{success}</p>}
      </form>
    </div>
  );
        }
