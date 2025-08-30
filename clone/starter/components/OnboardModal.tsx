'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
// Call server API to execute jobs to avoid bundling server SDKs client-side

type Provider = 'openai' | 'dust' | 'aci';

export default function OnboardModal() {
  const cardId = useStore((s) => s.onboardCardId);
  const card = useStore((s) => (cardId ? s.cards[cardId] : undefined));
  const setOnboardCard = useStore((s) => s.setOnboardCard);
  const moveCard = useStore((s) => s.moveCard);
  const [provider, setProvider] = useState<Provider>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [dustKey, setDustKey] = useState('');
  const [dustWorkspaceId, setDustWorkspaceId] = useState('');
  const [aciKey, setAciKey] = useState('');
  const [loading, setLoading] = useState(false);
  const setProviderOnCard = useStore((s) => s.updateCard);
  if (!card) return null;

  const needsKey = false; // optional overrides only for now (no hook to avoid hook-order issues)

  const start = async () => {
    setLoading(true);
    try {
      const hasDesc = card.description && card.description.trim().length >= 8;
      if (!hasDesc) {
        alert('Please add a clear Description with steps/instructions before starting.');
        setLoading(false);
        return;
      }
      const credentials = { openaiKey, dustKey, dustWorkspaceId, aciKey };
      await fetch('/api/run-job', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, provider, prompt: card.description, credentials }) });
      // Move to In Progress (l3)
      moveCard(card.id, 'l3', 0);
      setProviderOnCard(card.id, { provider });
      setOnboardCard(undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOnboardCard(undefined)}>
      <div className="w-full max-w-md rounded-lg bg-white p-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-3 text-lg font-semibold">Configure task runner</h2>
        <p className="mb-4 text-sm text-gray-600">Choose which app to run this task with.</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2"><input type="radio" name="prov" checked={provider==='openai'} onChange={() => setProvider('openai')} /> OpenAI</label>
          <label className="flex items-center gap-2"><input type="radio" name="prov" checked={provider==='dust'} onChange={() => setProvider('dust')} /> Dust</label>
          <label className="flex items-center gap-2"><input type="radio" name="prov" checked={provider==='aci'} onChange={() => setProvider('aci')} /> ACI.dev</label>
        </div>
        <div className="mt-3 space-y-2">
          {provider === 'openai' && (
            <input className="w-full rounded border px-2 py-1" placeholder="OpenAI API Key (optional override)" value={openaiKey} onChange={(e)=>setOpenaiKey(e.target.value)} />
          )}
          {provider === 'dust' && (
            <>
              <input className="w-full rounded border px-2 py-1" placeholder="Dust API Key (optional override)" value={dustKey} onChange={(e)=>setDustKey(e.target.value)} />
              <input className="w-full rounded border px-2 py-1" placeholder="Dust Workspace ID (optional override)" value={dustWorkspaceId} onChange={(e)=>setDustWorkspaceId(e.target.value)} />
            </>
          )}
          {provider === 'aci' && (
            <input className="w-full rounded border px-2 py-1" placeholder="ACI.dev API Key (optional override)" value={aciKey} onChange={(e)=>setAciKey(e.target.value)} />
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="rounded-md border px-3 py-1" onClick={() => setOnboardCard(undefined)}>Cancel</button>
          <button disabled={loading || needsKey} className="rounded-md bg-primary-600 px-3 py-1 text-white disabled:opacity-50" onClick={start}>{loading ? 'Starting…' : 'Start'}</button>
        </div>
        <div className="mt-3 text-xs text-gray-500">Tip: use a concise title and put concrete steps, inputs and expected outputs in Description.</div>
      </div>
    </div>
  );
}


