'use client';

import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function CardItem({ cardId }: { cardId: string }) {
  const card = useStore((s) => s.cards[cardId]);
  const openModal = useStore((s) => s.openModal);
  const markCardNotNew = useStore((s) => s.markCardNotNew);

  if (!card) return null;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cardId });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const ring = card.status === 'requiresAction' ? 'ring-2 ring-yellow-500 animate-pulse' : '';
  const newCardAnimation = card.isNew ? 'animate-pulse ring-2 ring-green-400 bg-green-50' : '';
  const badge = card.status && card.status !== 'idle' ? (
    <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{card.status}</span>
  ) : null;
  const title = (card.title ?? '').trim() || 'Untitled';

  // Clear isNew flag after animation
  useEffect(() => {
    if (card.isNew) {
      const timer = setTimeout(() => {
        markCardNotNew(cardId);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [card.isNew, cardId, markCardNotNew]);
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`rounded-md bg-white p-2 elevation-sm cursor-grab active:cursor-grabbing ${ring} ${newCardAnimation}`}>
      <button className="text-left w-full" aria-label={`Open card ${title}`} onClick={() => openModal(card.id)} onKeyDown={(e)=>{ if(e.key==='Enter') openModal(card.id); }}>
        <div className="text-sm flex items-center">
          <span>{title}</span>
          {badge}
        </div>
      </button>
    </div>
  );
}

