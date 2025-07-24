import { useEffect, useState } from 'react'; import { supabase } from '@/lib/supabaseclient'; import Link from 'next/link'; import { useSession } from '@supabase/auth-helpers-react';

export default function UserDashboard() { const session = useSession(); const user = session?.user;

const [points, setPoints] = useState(0); const [username, setUsername] = useState(''); const [favouriteTeam, setFavouriteTeam] = useState(''); const [profileMessage, setProfileMessage] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [passwordMessage, setPasswordMessage] = useState('');

useEffect(() => { if (!user) return;

const fetchData = async () => {
  const { data: pointsData } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', user.id)
    .single();

  setPoints(pointsData?.total_points || 0);

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, favourite_team')
    .eq('id', user.id)
    .single();

  setUsername(profile?.username || '');
  setFavouriteTeam(profile?.favourite_team || '');
};

fetchData();

}, [user]);

const updateUsername = async () => { setProfileMessage(''); if (!username.trim()) { setProfileMessage('Username cannot be empty.'); return; } const { error } = await supabase .from('profiles') .update({ username: username.trim(), favourite_team: favouriteTeam.trim() }) .eq('id', user.id);

if (error) {
  console.error(error);
  setProfileMessage('Failed to update profile.');
} else {
  setProfileMessage('Profile updated successfully.');
}

};

const updatePassword = async () => { setPasswordMessage(''); if (!newPassword || newPassword !== confirmPassword) { setPasswordMessage('Passwords do not match or are empty.'); return; }

const { error } = await supabase.auth.updateUser({ password: newPassword });

if (error) {
  console.error(error);
  setPasswordMessage('Failed to update password.');
} else {
  setPasswordMessage('Password updated successfully.');
  setNewPassword('');
  setConfirmPassword('');
}

};

if (!user) return <p className="p-4">Loading...</p>;

return ( <div className="p-4 max-w-3xl mx-auto mt-6"> <h1 className="text-2xl font-bold mb-1">Welcome!</h1> <p className="mb-2 text-xs text-gray-400">User ID: {user.id}</p> <p className="mb-4">Total Points: <strong>{points}</strong></p>

<div className="mb-6 border p-4 rounded bg-gray-50">
    <h3 className="font-semibold mb-2">Update Profile</h3>
    <input
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="border px-2 py-1 mb-2 w-full"
      placeholder="Enter username"
    />
    <input
      type="text"
      value={favouriteTeam}
      onChange={(e) => setFavouriteTeam(e.target.value)}
      className="border px-2 py-1 mb-2 w-full"
      placeholder="Favourite team"
    />
    <button
      onClick={updateUsername}
      className="bg-blue-500 text-white px-4 py-2 rounded w-full"
    >
      Save Changes
    </button>
    {profileMessage && <p className="text-sm mt-2">{profileMessage}</p>}
  </div>

  <div className="mb-6 border p-4 rounded bg-gray-50">
    <h3 className="font-semibold mb-2">Change Password</h3>
    <input
      type="password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="border px-2 py-1 mb-2 w-full"
      placeholder="New password"
    />
    <input
      type="password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="border px-2 py-1 mb-2 w-full"
      placeholder="Confirm new password"
    />
    <button
      onClick={updatePassword}
      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
    >
      Update Password
    </button>
    {passwordMessage && <p className="text-sm mt-2">{passwordMessage}</p>}
  </div>

  <Link href="/dashboard" className="block text-center bg-blue-700 text-white px-4 py-2 rounded">
    Back to Dashboard
  </Link>
</div>

); }
