import '@/styles/globals.css';
import { useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Navbar from '@/components/Navbar'; // ✅ make sure the path is correct

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Navbar /> {/* ✅ Shows on every page */}
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;
