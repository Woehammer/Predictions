// pages/leagues.js
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashboard');
  }, []);
  return null;
}
