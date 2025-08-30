'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import ListColumn from '@/components/ListColumn';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

export default function Board() {
  const boardId = useStore((s) => s.currentBoardId);
  const board = useStore((s) => s.boards[boardId]);
  const moveCard = useStore((s) => s.moveCard);
  const createList = useStore((s) => s.createList);
  const [addingList, setAddingList] = useState(false);
  const [listTitle, setListTitle] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const cardId = String(active.id);
    const overId = String(over.id);

    const state = useStore.getState();
    // Determine source list
    const sourceListId = state.cards[cardId]?.listId;
    if (!sourceListId) return;
    // Determine destination list and index
    let destListId = sourceListId;
    let position = state.lists[destListId].cardIds.indexOf(overId);
    if (position === -1) {
      if (state.lists[overId]) {
        destListId = overId; // dropped on empty space of list container
        position = state.lists[destListId].cardIds.length;
      } else {
        const overCard = state.cards[overId];
        if (overCard) {
          destListId = overCard.listId;
          position = state.lists[destListId].cardIds.indexOf(overId);
          if (position === -1) position = state.lists[destListId].cardIds.length;
        }
      }
    }
    moveCard(cardId, destListId, position);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto">
        {board.listIds.map((id) => (
          <ListColumn key={id} listId={id} />
        ))}
        <div className="min-w-[272px] p-2 rounded-md bg-white/60 backdrop-blur elevation-sm">
          {addingList ? (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                placeholder="List title"
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && listTitle.trim()) {
                    createList(listTitle.trim());
                    setListTitle('');
                    setAddingList(false);
                  } else if (e.key === 'Escape') {
                    setAddingList(false);
                    setListTitle('');
                  }
                }}
                autoFocus
              />
              <button
                className="rounded-md bg-primary-600 px-2 py-1 text-white text-sm"
                onClick={() => {
                  if (!listTitle.trim()) return;
                  createList(listTitle.trim());
                  setListTitle('');
                  setAddingList(false);
                }}
              >
                Add
              </button>
            </div>
          ) : (
            <button className="w-full rounded-md bg-white px-3 py-2 text-sm" onClick={() => setAddingList(true)}>
              + Add another list
            </button>
          )}
        </div>
      </div>
    </DndContext>
  );
}

