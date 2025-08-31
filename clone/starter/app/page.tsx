'use client';

import React from 'react';
import Board from '@/components/Board';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CardModal from '@/components/CardModal';
import { useSupabaseCardSync } from '@/lib/telemetry';
import OnboardModal from '@/components/OnboardModal';
import AdminKeysPanel from '@/components/AdminKeysPanel';

const queryClient = new QueryClient();

export default function HomePage() {
  // For now, skip Supabase sync and API calls if keys aren't configured
  // This allows the app to load even without all API keys set up
  const enableSupabase = false; // Set to true when Supabase keys are configured
  const enableDust = false; // Set to true when Dust API key is configured

  if (enableSupabase) {
    useSupabaseCardSync();
  }

  React.useEffect(() => {
    if (enableDust) {
      fetch('/api/dust/ensure', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ boardId: 'b1' }) }).catch(()=>{});
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen p-4">
        <Board />
        <CardModal />
        <OnboardModal />
        <AdminKeysPanel />
      </main>
    </QueryClientProvider>
  );
}

