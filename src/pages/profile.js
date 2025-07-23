// pages/profile.js import { useState, useEffect } from 'react'; import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ProfilePage() { const session = useSession(); const supabase = useSupabaseClient(); const [name, setName] = useState(''); const [loading, setLoading] = useState(false);

useEffect(() => { if (session) fetchProfile(); }, [session]);

async function fetchProfile() { setLoading(true); const { data, error } = await supabase .from('profiles') .select('name') .eq('id', session.user.id) .single(); if (data) setName(data.name || ''); setLoading(false); }

async function updateProfile(e) { e.preventDefault(); setLoading(true); const updates = { id: session.user.id, name, }; const { error } = await supabase.from('profiles').upsert(updates); if (error) alert('Error updating profile'); else alert('Profile updated'); setLoading(false); }

if (!session) return <p>Please sign in</p>;

return ( <div className="max-w-md mx-auto p-4"> <h1 className="text-xl font-bold mb-4">Your Profile</h1> <form onSubmit={updateProfile} className="space-y-4"> <div> <label className="block text-sm font-medium">Display Name</label> <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Your name" /> </div> <button
type="submit"
className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
disabled={loading}
> {loading ? 'Saving...' : 'Save Profile'} </button> </form> </div> ); }

