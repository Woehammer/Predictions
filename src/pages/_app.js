// pages/_app.js
import '@/styles/globals.css';
import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'; // ✅ updated
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import Navbar from '@/components/Navbar';

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createPagesBrowserClient()); // ✅ updated

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Navbar />
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}

export default MyApp;
