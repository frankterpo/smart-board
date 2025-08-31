'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider: 'openai' | 'dust' | 'aci';
  timestamp: string;
  metadata?: any;
  reasoning?: string;
}

interface AgentChatProps {
  cardId: string;
}

export default function AgentChat({ cardId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'dust' | 'aci'>('openai');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    loadChatHistory();
  }, [cardId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: newMessage.trim(),
      provider: selectedProvider,
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
        provider: userMessage.provider,
        timestamp: userMessage.timestamp,
      });

      // Send to appropriate AI provider
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cardId,
          message: userMessage.content,
          provider: selectedProvider,
          history: messages.slice(-10), // Last 10 messages for context
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error.',
        provider: selectedProvider,
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
        provider: selectedProvider,
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Agent Chat</h3>
        <div className="flex gap-2">
          {[
            { key: 'openai', label: 'OpenAI', color: 'bg-green-100 text-green-800' },
            { key: 'dust', label: 'Dust', color: 'bg-purple-100 text-purple-800' },
            { key: 'aci', label: 'ACI', color: 'bg-blue-100 text-blue-800' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSelectedProvider(key as any)}
              className={`px-2 py-1 rounded text-xs font-medium ${
                selectedProvider === key ? color : 'bg-gray-100 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
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
