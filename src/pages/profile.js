import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseclient';

export default function ProfilePage() {
  const session = useSession();
  const user = session?.user;

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setMessage('Failed to load profile.');
      } else {
        setUsername(data.username || '');
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username });

    if (error) {
      console.error('Update error:', error);
      setMessage('Failed to update username.');
    } else {
      setMessage('Username updated!');
    }

    setLoading(false);
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <label className="block mb-2 font-semibold">Username</label>
      <input
        className="border p-2 w-full mb-4"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={updateProfile}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
      }
