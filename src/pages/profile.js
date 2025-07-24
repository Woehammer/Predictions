import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseclient'; import { useSession } from '@supabase/auth-helpers-react'; import Link from 'next/link';

export default function UserProfile() { const session = useSession(); const user = session?.user;

const [username, setUsername] = useState(''); const [profileMessage, setProfileMessage] = useState(''); const [profilePic, setProfilePic] = useState(null); const [favTeam, setFavTeam] = useState('');

useEffect(() => { if (!user) return;

const fetchData = async () => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, fav_team, profile_pic')
    .eq('id', user.id)
    .single();

  setUsername(profile?.username || '');
  setFavTeam(profile?.fav_team || '');
  setProfilePic(profile?.profile_pic || null);
};

fetchData();

}, [user]);

const updateProfile = async () => { setProfileMessage(''); if (!username.trim()) { setProfileMessage('Username cannot be empty.'); return; } const { error } = await supabase .from('profiles') .update({ username: username.trim(), fav_team: favTeam, profile_pic: profilePic }) .eq('id', user.id);

if (error) {
  console.error(error);
  setProfileMessage('Failed to update profile.');
} else {
  setProfileMessage('Profile updated successfully.');
}

};

const handleFileChange = async (e) => { const file = e.target.files[0]; if (!file) return;

const { data, error } = await supabase.storage.from('avatars').upload(`${user.id}/avatar.png`, file, {
  upsert: true,
});

if (error) {
  console.error('Upload error:', error);
} else {
  const publicUrl = supabase.storage.from('avatars').getPublicUrl(`${user.id}/avatar.png`).data.publicUrl;
  setProfilePic(publicUrl);
}

};

if (!user) return <p className="p-4">Loading...</p>;

return ( <div className="p-4 max-w-3xl mx-auto mt-6"> <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

{profilePic && (
    <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full mb-4 object-cover" />
  )}
  <div className="mb-4">
    <label className="block text-sm font-medium">Profile Picture</label>
    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium">Username</label>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="border px-2 py-1 w-full"
    />
  </div>

  <div className="mb-4">
    <label className="block text-sm font-medium">Favourite Team</label>
    <input
      type="text"
      value={favTeam}
      onChange={(e) => setFavTeam(e.target.value)}
      className="border px-2 py-1 w-full"
    />
  </div>

  <div className="mb-4">
    <button
      onClick={updateProfile}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Save Changes
    </button>
  </div>

  {profileMessage && <p className="text-sm mt-2">{profileMessage}</p>}

  <div className="mt-6">
    <Link href="/dashboard" className="text-blue-600 underline hover:text-blue-800">
      Back to Dashboard
    </Link>
  </div>
</div>

); }

