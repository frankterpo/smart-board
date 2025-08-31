'use client';

import React, { useState } from 'react';

export default function ShortcutsInfo() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: '⌘⌥N', description: 'Create new card' },
    { keys: '⌘K', description: 'Search cards' },
    { keys: 'Esc', description: 'Close modal/cancel' },
    { keys: 'Space (hold)', description: 'Voice input' },
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Keyboard shortcuts"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4"/>
          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3"/>
          <path d="M3 12c1 0 3-1 3-3s-2-3-3-3"/>
          <path d="M12 3c0 1-1 3-3 3s-3-2-3-3"/>
          <path d="M12 21c0-1-1-3-3-3s-3 2-3 3"/>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">Esc</kbd> to close this dialog
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

