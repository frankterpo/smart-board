'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import CardItem from '@/components/CardItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

export default function ListColumn({ listId }: { listId: string }) {
  const list = useStore((s) => s.lists[listId]);
  const createCard = useStore((s) => s.createCard);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { setNodeRef, isOver } = useDroppable({ id: listId });

  return (
    <div className={`min-w-[272px] max-w-[300px] rounded-md backdrop-blur elevation-sm p-2 transition-colors ${isOver ? 'bg-primary-100 ring-2 ring-primary-500' : 'bg-white/70'}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{list.title}</h2>
      </div>
      <SortableContext items={list.cardIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex flex-col gap-2 max-h-[70vh] overflow-y-auto pr-1">
          {list.cardIds.map((cardId) => (
            <CardItem key={cardId} cardId={cardId} />
          ))}
        </div>
      </SortableContext>
      <div className="mt-2 sticky bottom-0 pt-2 bg-gradient-to-t from-white/80 to-transparent">
        {adding ? (
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
              placeholder="Add a card"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && title.trim()) {
                  createCard(listId, title.trim());
                  setTitle('');
                  setAdding(false);
                } else if (e.key === 'Escape') {
                  setAdding(false);
                }
              }}
              autoFocus
            />
            <button
              className="rounded-md bg-primary-600 px-2 py-1 text-white text-sm"
              onClick={() => {
                if (!title.trim()) return;
                createCard(listId, title.trim());
                setTitle('');
                setAdding(false);
              }}
            >
              Add
            </button>
          </div>
        ) : (
          <button className="w-full rounded-md bg-white px-3 py-2 text-sm" onClick={() => setAdding(true)}>
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}

