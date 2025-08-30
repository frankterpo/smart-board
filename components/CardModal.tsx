'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import AppsConfig from '@/components/AppsConfig';

export default function CardModal() {
  const cardId = useStore((s) => s.modalCardId);
  const card = useStore((s) => (cardId ? s.cards[cardId] : undefined));
  const close = useStore((s) => s.closeModal);
  const archive = useStore((s) => s.archiveCard);
  const [jobResult, setJobResult] = useState<any>(null);
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchQuery = `${card?.title ?? ''} ${card?.description ?? ''}`.trim() || (card?.title ?? 'task');

  async function refreshData() {
    if (!card) return;
    setLoading(true);
    try {
      // Latest job result for this card
      const { data: jobs } = await supabase
        .from('jobs')
        .select('result, status, created_at, provider')
        .eq('card_id', card.id)
        .order('created_at', { ascending: false })
        .limit(1);
      setJobResult(jobs && jobs[0] ? jobs[0] : null);

      // Knowledge search via vector store
      const res = await fetch('/api/card-memory', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, action: 'search', text: searchQuery }),
      });
      const json = await res.json().catch(() => ({}));
      const items = json?.results?.data ?? [];
      setKnowledge(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!card) return;
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardId, searchQuery]);

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6" onClick={close}>
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <input
            className="w-full rounded-md border border-gray-300 px-2 py-1 text-lg font-semibold"
            defaultValue={card.title}
            onBlur={(e) => useStore.getState().updateCard(card.id, { title: e.target.value })}
          />
          <button className="ml-3 rounded-md border px-3 py-1" onClick={close} aria-label="Close modal">
            Esc
          </button>
        </div>
        <div className="space-y-4">
          <section>
            <h3 className="mb-1 text-sm font-semibold">Description</h3>
            <textarea
              className="w-full min-h-[120px] rounded-md border border-gray-300 p-2"
              placeholder="Add a more detailed description..."
              defaultValue={card.description}
              onBlur={async (e) => {
                useStore.getState().updateCard(card.id, { description: e.target.value });
                // Auto-seed memory with latest description
                const seedText = `${card.title}\n\n${e.target.value}`.trim();
                if (seedText.length > 0) {
                  try {
                    await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'ensure' }) });
                    await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'upload', text: seedText }) });
                  } catch {}
                }
              }}
            />
          </section>

          {card.status === 'requiresAction' && (
            <div className="rounded border border-yellow-400 bg-yellow-50 p-2 text-xs text-yellow-800">
              Changes detected since last run. Rerun the job to update results.
              <button
                className="ml-2 rounded bg-yellow-600 px-2 py-0.5 text-white"
                onClick={async () => {
                  await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'upload', text: `${card.title}\n\n${card.description ?? ''}` }) });
                  await fetch('/api/run-job', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, provider: card.provider ?? 'openai', prompt: card.description ?? card.title }) });
                  await refreshData();
                }}
              >
                Rerun now
              </button>
            </div>
          )}

          <section>
            <h3 className="mb-1 text-sm font-semibold">Apps</h3>
            <AppsConfig cardId={card.id} />
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Latest result</h3>
              <button className="text-xs underline" onClick={refreshData} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-md bg-gray-50 p-2 text-xs">
{JSON.stringify(jobResult ?? { hint: 'No job results yet. Start a job from To Do onboarding.' }, null, 2)}
            </pre>
          </section>

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Knowledge (vector search)</h3>
              <div className="flex items-center gap-2">
                <button className="text-xs underline" onClick={refreshData} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
                <button
                  className="text-xs rounded bg-gray-800 px-2 py-0.5 text-white"
                  onClick={async () => {
                    try {
                      await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'ensure' }) });
                      await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'upload', text: `${card.title}\n\n${card.description ?? ''}` }) });
                      await refreshData();
                    } catch {}
                  }}
                >
                  Add to memory
                </button>
              </div>
            </div>
            {knowledge.length === 0 ? (
              <div className="text-xs text-gray-500">No matches yet. Add more context in Description or upload documents to this card’s memory.</div>
            ) : (
              <ol className="space-y-2 text-xs">
                {knowledge.map((k: any, i: number) => (
                  <li key={i} className="rounded border p-2">
                    <div className="mb-1 font-medium">{k.filename ?? k.file_name ?? k.file_id}</div>
                    {(k.content ?? []).slice(0, 3).map((c: any, j: number) => (
                      <p key={j} className="text-gray-700">{c.text}</p>
                    ))}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <button
            className="rounded-md bg-red-600 px-3 py-1 text-white"
            onClick={() => archive(card.id)}
          >
            Archive card
          </button>
          <div className="text-xs text-gray-500">Press Esc to close</div>
        </div>
      </div>
    </div>
  );
}

