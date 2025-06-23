import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';

export default function Home() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    const fetchLeagues = async () => {
      const { data, error } = await supabase.from('leagues').select('*');
      if (error) {
        console.error('Error fetching leagues:', error.message);
      } else {
        setLeagues(data);
      }
    };

    fetchLeagues();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Supabase Connected!</h1>
      <h2 className="text-xl mb-2">Leagues:</h2>
      {leagues.length === 0 ? (
        <p>No leagues found.</p>
      ) : (
        <ul className="list-disc pl-5">
          {leagues.map((league) => (
            <li key={league.id}>
              {league.name}
              {league.created_by && (
                <span className="text-sm text-gray-500"> (created by {league.created_by})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
