'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider: 'openai';
  timestamp: string;
  metadata?: any;
  reasoning?: string;
  type?: 'suggestion' | 'analysis' | 'confirmation' | 'regular';
  proposedChanges?: {
    title?: string;
    description?: string;
    tools?: string[];
  };
}

interface AgentChatProps {
  cardId: string;
}

export default function AgentChat({ cardId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardAgent, setCardAgent] = useState<any>(null);
  const [configuredApps, setConfiguredApps] = useState<any[]>([]);
  const [showAppManager, setShowAppManager] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const card = useStore((s) => s.cards[cardId]);
  const updateCard = useStore((s) => s.updateCard);

  // Load chat history
  useEffect(() => {
    loadChatHistory();
  }, [cardId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-analyze card when it changes
  useEffect(() => {
    if (card && messages.length === 0) {
      // Only analyze if this is the first time and card exists
      analyzeCardAndSuggestImprovements();
    }
  }, [card, messages.length]);

  // Load available tools
  useEffect(() => {
    loadAvailableTools();
  }, [cardId]);

  // Initialize card agent
  useEffect(() => {
    if (card) {
      initializeCardAgent();
      loadConfiguredApps();
    }
  }, [card]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, provider, timestamp, metadata, reasoning')
        .eq('card_id', cardId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadConfiguredApps = async () => {
    try {
      const response = await fetch(`/api/agent/configure-app?cardId=${cardId}`);
      const data = await response.json();

      if (data.apps) {
        setConfiguredApps(data.apps);
      }
    } catch (error) {
      console.error('Failed to load configured apps:', error);
      setConfiguredApps([]);
    }
  };

  const analyzeCardAndSuggestImprovements = async () => {
    if (!card) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          title: card.title,
          description: card.description || '',
          configuredApps: configuredApps.map(app => app.app_name)
        })
      });

      const data = await response.json();

      const analysisMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: 'assistant',
        content: data.analysis || 'Card analyzed successfully.',
        provider: 'openai',
        timestamp: new Date().toISOString(),
        type: 'analysis',
        proposedChanges: data.suggestedChanges
      };

      setMessages([analysisMessage]);

      // Save to database
      await supabase.from('chat_messages').insert({
        id: analysisMessage.id,
        card_id: cardId,
        role: 'assistant',
        content: analysisMessage.content,
        provider: 'openai',
        metadata: { type: 'analysis', suggestedChanges: data.suggestedChanges }
      });

    } catch (error) {
      console.error('Failed to analyze card:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Failed to analyze card. Please try again.',
        provider: 'openai',
        timestamp: new Date().toISOString()
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: newMessage.trim(),
      provider: 'openai',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Save user message to Supabase
      await supabase.from('chat_messages').insert({
        id: userMessage.id,
        card_id: cardId,
        role: userMessage.role,
        content: userMessage.content,
        provider: 'openai',
        timestamp: userMessage.timestamp,
      });

      // Send to card agent
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cardId,
          message: userMessage.content,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error.',
        provider: 'openai',
        timestamp: new Date().toISOString(),
        metadata: data.metadata,
        reasoning: data.metadata?.reasoning,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save assistant message to Supabase
      await supabase.from('chat_messages').insert({
        id: assistantMessage.id,
        card_id: cardId,
        role: assistantMessage.role,
        content: assistantMessage.content,
        provider: assistantMessage.provider,
        timestamp: assistantMessage.timestamp,
        metadata: assistantMessage.metadata,
        reasoning: assistantMessage.reasoning,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 2}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
        provider: 'openai',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const applySuggestedChanges = async (proposedChanges: any) => {
    if (!proposedChanges) return;

    let appliedChanges = false;

    if (proposedChanges.title && confirm(`Apply suggested title: "${proposedChanges.title}"?`)) {
      updateCard(cardId, { title: proposedChanges.title });
      appliedChanges = true;
    }

    if (proposedChanges.description && confirm(`Apply suggested description?`)) {
      updateCard(cardId, { description: proposedChanges.description });
      appliedChanges = true;
    }

    if (appliedChanges) {
      // Add confirmation message
      const confirmationMessage: Message = {
        id: `confirmation-${Date.now()}`,
        role: 'assistant',
        content: '✅ Changes applied to your card! The task is now optimized for execution.',
        provider: 'openai',
        timestamp: new Date().toISOString(),
        type: 'confirmation'
      };

      setMessages(prev => [...prev, confirmationMessage]);

      // Save confirmation to database
      await supabase.from('chat_messages').insert({
        id: confirmationMessage.id,
        card_id: cardId,
        role: 'assistant',
        content: confirmationMessage.content,
        provider: 'openai',
        metadata: { type: 'confirmation' }
      });
    }
  };

  const initializeCardAgent = async () => {
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          message: 'Initialize agent for this card',
          conversationHistory: []
        })
      });

      const data = await response.json();
      if (data.agent) {
        setCardAgent(data.agent);
      }
    } catch (error) {
      console.error('Failed to initialize card agent:', error);
    }
  };

  const configureApp = async (appName: string) => {
    try {
      const instructions = prompt(`How would you like to configure ${appName}? Describe what you need it for:`);
      if (!instructions) return;

      const response = await fetch('/api/agent/configure-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          appName,
          userInstructions: instructions
        })
      });

      const data = await response.json();

      // Add configuration result to chat
      const configMessage: Message = {
        id: `config-${Date.now()}`,
        role: 'assistant',
        content: `App Configuration: ${appName}\n\n${data.message}`,
        provider: 'openai',
        timestamp: new Date().toISOString(),
        type: 'regular'
      };

      setMessages(prev => [...prev, configMessage]);

      // Refresh configured apps
      if (data.success) {
        loadConfiguredApps();
      }

    } catch (error) {
      console.error('Failed to configure app:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Failed to configure ${appName}. Please try again.`,
        provider: 'openai',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Task Agent</h3>
        <p className="text-xs text-gray-600 mb-3">AI assistant to optimize and execute your task</p>

        {/* Card Agent Status */}
        {cardAgent && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center text-xs text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {cardAgent.name} Active
            </div>
          </div>
        )}

        {/* App Configuration Management */}
        <div className="mb-3">
          <button
            onClick={() => setShowAppManager(!showAppManager)}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors mb-2"
          >
            {showAppManager ? 'Hide' : 'Show'} App Manager
          </button>

          {showAppManager && (
            <div className="space-y-2">
              {/* Configured Apps */}
              {configuredApps.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Configured Apps:</p>
                  <div className="flex flex-wrap gap-1">
                    {configuredApps.map((app) => (
                      <div key={app.app_name} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        <span>{app.app_name}</span>
                        <button
                          onClick={() => configureApp(app.app_name)}
                          className="ml-1 text-green-600 hover:text-green-800"
                          title="Reconfigure"
                        >
                          ⚙️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick App Setup */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Quick Setup:</p>
                <div className="flex flex-wrap gap-1">
                  {['GMAIL', 'BRAVE_SEARCH', 'SLACK', 'NOTION', 'GITHUB', 'TWITTER'].map((appName) => (
                    <button
                      key={appName}
                      onClick={() => configureApp(appName)}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                      title={`Configure ${appName}`}
                    >
                      + {appName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Start a conversation with the AI agent to get help with this task.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && message.reasoning && (
                  <div className="mb-2 p-2 bg-white/50 rounded text-xs border-l-2 border-blue-400">
                    <div className="font-medium text-blue-700 mb-1">🤔 Agent Reasoning:</div>
                    <div className="text-gray-700 italic">{message.reasoning}</div>
                  </div>
                )}

                {/* Suggested Changes */}
                {message.role === 'assistant' && message.proposedChanges && (
                  <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="font-medium text-yellow-800 mb-2">💡 Suggested Improvements:</div>
                    {message.proposedChanges.title && (
                      <div className="text-sm mb-1">
                        <strong>Title:</strong> {message.proposedChanges.title}
                      </div>
                    )}
                    {message.proposedChanges.description && (
                      <div className="text-sm mb-2">
                        <strong>Description:</strong> {message.proposedChanges.description}
                      </div>
                    )}
                    <button
                      onClick={() => applySuggestedChanges(message.proposedChanges)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                    >
                      ✅ Apply Changes
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  {message.role === 'assistant' && message.provider && (
                    <span className="px-1 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                      {message.provider}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the AI agent for help..."
            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
