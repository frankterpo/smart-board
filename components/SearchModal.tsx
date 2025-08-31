'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const cards = useStore((s) => s.cards);
  const lists = useStore((s) => s.lists);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filter cards based on search query
  const filteredCards = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return Object.values(cards).filter(card =>
      card.title.toLowerCase().includes(searchTerm) ||
      card.description?.toLowerCase().includes(searchTerm)
    );
  }, [cards, query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCards.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCards[selectedIndex]) {
            // Open the selected card
            const card = filteredCards[selectedIndex];
            // You could emit an event here to open the card modal
            console.log('Open card:', card);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCards, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden">
        {/* Search input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search cards..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full pl-10 pr-4 py-3 text-lg border-none outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() && filteredCards.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No cards found matching "{query}"
            </div>
          )}

          {filteredCards.map((card, index) => {
            const list = lists[card.listId];
            return (
              <div
                key={card.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  index === selectedIndex ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  console.log('Open card:', card);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{card.title}</h3>
                    {card.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-xs text-gray-500">
                    {list?.title || 'Unknown List'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
          <div>
            {filteredCards.length > 0 && (
              <span>
                {selectedIndex + 1} of {filteredCards.length} results
              </span>
            )}
          </div>
          <div className="flex space-x-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}

