import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';

export default function Home() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.rpc('pg_catalog.pg_tables');
      if (error) {
        console.error('Error fetching tables:', error);
      } else {
        setTables(data);
      }
    };

    fetchTables();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Supabase Connected!</h1>
      <h2 className="text-xl">Tables:</h2>
      <ul>
        {tables.map((table, idx) => (
          <li key={idx}>{table.schemaname}.{table.tablename}</li>
        ))}
      </ul>
    </div>
  );
}
