'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import AppsConfig from '@/components/AppsConfig';
import AgentChat from '@/components/AgentChat';

export default function CardModal() {
  const cardId = useStore((s) => s.modalCardId);
  const card = useStore((s) => (cardId ? s.cards[cardId] : undefined));
  const close = useStore((s) => s.closeModal);
  const archive = useStore((s) => s.archiveCard);
  const [appsExpanded, setAppsExpanded] = useState(false);
  const [description, setDescription] = useState(card?.description || '');
  const [showAtSuggestions, setShowAtSuggestions] = useState(false);
  const [atQuery, setAtQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [availableTools, setAvailableTools] = useState<any[]>([]);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Update description when card changes
  useEffect(() => {
    if (card?.description !== undefined) {
      setDescription(card.description || '');
    }
  }, [card?.description]);

  // Fetch available tools for @ mentions
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await fetch('/api/aci/suggest', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ cardId: card?.id, context: description })
        });
        const data = await res.json();
        // Transform ACI apps to tool format expected by @mentions
        const tools = (data.apps || []).map((app: any) => ({
          id: app.app_name || app.name,
          name: app.app_name || app.name,
          description: app.reason || `ACI app: ${app.app_name || app.name}`,
          logo: null
        }));
        setAvailableTools(tools);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      }
    };

    if (card) {
      fetchTools();
    }
  }, [card?.id, description]);

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    useStore.getState().updateCard(card!.id, { description: value });

    // Handle @ mentions
    const cursorPos = descriptionRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setShowAtSuggestions(true);
      setAtQuery(atMatch[1]);
      setCursorPosition(cursorPos);
    } else {
      setShowAtSuggestions(false);
      setAtQuery('');
    }
  };

  const insertToolMention = (tool: any) => {
    const beforeAt = description.substring(0, cursorPosition - atQuery.length - 1);
    const afterAt = description.substring(cursorPosition);
    const mention = `@${tool.name}`;
    const newDescription = beforeAt + mention + ' ' + afterAt;

    setDescription(newDescription);
    useStore.getState().updateCard(card!.id, { description: newDescription });
    setShowAtSuggestions(false);
    setAtQuery('');

    // Focus back to textarea and set cursor position
    setTimeout(() => {
      descriptionRef.current?.focus();
      const newCursorPos = beforeAt.length + mention.length + 1;
      descriptionRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6" onClick={close}>
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{card.title}</h2>
          <button className="rounded-md border px-3 py-1 hover:bg-gray-50" onClick={close}>
            Esc
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          {/* Left side - Card details */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Description with @ mentions */}
            <section className="relative">
              <h3 className="mb-2 text-sm font-semibold">Description</h3>
              <div className="relative">
                <textarea
                  ref={descriptionRef}
                  className="w-full min-h-[120px] rounded-md border border-gray-300 p-3 text-sm"
                  placeholder="Describe your task... Use @ to mention tools"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  onBlur={() => setShowAtSuggestions(false)}
                />

                {/* @ Mentions dropdown */}
                {showAtSuggestions && availableTools.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {availableTools
                      .filter(tool => tool.name.toLowerCase().includes(atQuery.toLowerCase()))
                      .slice(0, 5)
                      .map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => insertToolMention(tool)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs">
                            {tool.logo || tool.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* Collapsible Apps section */}
            <section>
              <button
                onClick={() => setAppsExpanded(!appsExpanded)}
                className="flex items-center gap-2 w-full text-left"
              >
                <h3 className="text-sm font-semibold">Apps & Tools</h3>
                <svg
                  className={`w-4 h-4 transition-transform ${appsExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {appsExpanded && (
                <div className="mt-2">
                  <AppsConfig cardId={card.id} />
                </div>
              )}
            </section>
          </div>

          {/* Right side - Agent Chat */}
          <div className="w-full lg:w-96 border-l">
            <AgentChat cardId={card.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
          <button
            className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
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

