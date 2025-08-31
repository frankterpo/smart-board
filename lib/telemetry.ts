'use client';

import { useEffect } from 'react';
import { eventBus } from './events';
import { upsertCard } from './supabase';
import { useStore } from './store';

export function useSupabaseCardSync() {
  const cards = useStore((s) => s.cards);
  useEffect(() => {
    const unsub = eventBus.subscribe(async (e) => {
      if (e.type === 'card:created' || e.type === 'card:updated' || e.type === 'card:moved') {
        const c = cards[e.type === 'card:created' ? e.payload.cardId : e.payload.cardId];
        const card = c ?? cards[e.payload.cardId];
        if (!card) return;
        await upsertCard({ id: card.id, title: card.title, listId: card.listId, position: card.position, description: card.description });
        if (e.type === 'card:created') {
          // Ensure vector store exists for this card, and seed with title/description
          try {
            await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'ensure' }) });
            const seedText = `${card.title}\n\n${card.description ?? ''}`.trim();
            if (seedText.length > 0) {
              await fetch('/api/card-memory', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: card.id, action: 'upload', text: seedText }) });
            }
            // Ensure Dust workspace and space + datasource
            await fetch('/api/dust/ensure', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ boardId: 'b1', cardId: card.id }) });
          } catch {}
        }
      }
    });
    return () => {
      unsub(); // Call the unsubscribe function
    };
  }, [cards]);
}

