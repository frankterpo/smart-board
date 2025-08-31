'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/lib/store';
import { searchACITools } from '@/lib/aci';

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
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [aciAgent, setAciAgent] = useState<any>(null);
  const [aciApps, setAciApps] = useState<any[]>([]);
  const [showToolSelector, setShowToolSelector] = useState(false);
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

  // Initialize ACI agent for this card
  useEffect(() => {
    if (card) {
      initializeACIAgent();
      loadACITools();
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

  const loadAvailableTools = async () => {
    try {
      const response = await fetch('/api/aci/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      const data = await response.json();

      if (data.error) {
        console.error('ACI API Error:', data.error);
        // Show error message about missing ACI key
        if (data.error.includes('ACI API key is required')) {
          setAvailableTools([]);
          // Could show a toast or error message here
          console.warn('ACI key is required but not configured');
        }
        return;
      }

      if (data.apps) {
        setAvailableTools(data.apps.map((app: any) => app.app_name));
      }
    } catch (error) {
      console.error('Failed to load available tools:', error);
      setAvailableTools([]);
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
          availableTools
        })
      });

      const data = await response.json();

      let analysisContent = data.analysis;
      if (data.error) {
        analysisContent = `⚠️ **Configuration Required**: ${data.error}\n\nPlease add your ACI API key in the admin settings to enable tool integration and get better task optimization suggestions.`;
      }

      const analysisMessage: Message = {
        id: `analysis-${Date.now()}`,
        role: 'assistant',
        content: analysisContent,
        provider: 'openai',
        timestamp: new Date().toISOString(),
        type: data.error ? 'regular' : 'analysis',
        proposedChanges: data.suggestedChanges
      };

      setMessages([analysisMessage]);

      // Also save to database
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

      // Send to OpenAI with enhanced context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cardId,
          message: userMessage.content,
          provider: 'openai',
          history: messages.slice(-10), // Last 10 messages for context
          availableTools: selectedTools.length > 0 ? selectedTools : availableTools,
          cardContext: {
            title: card?.title,
            description: card?.description
          }
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

  const toggleTool = (toolName: string) => {
    setSelectedTools(prev =>
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const initializeACIAgent = async () => {
    try {
      const response = await fetch('/api/aci/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          title: card.title,
          description: card.description
        })
      });

      const data = await response.json();
      if (data.agent) {
        setAciAgent(data.agent);
      }
    } catch (error) {
      console.error('Failed to initialize ACI agent:', error);
    }
  };

  const loadACITools = async () => {
    try {
      // Search for relevant ACI tools based on card content
      const intent = `${card.title} ${card.description || ''}`.trim();
      const tools = await searchACITools(intent, undefined, 8);
      setAciApps(tools);

      // Get subscribed apps for this card
      const response = await fetch(`/api/aci/apps?cardId=${cardId}`);
      const data = await response.json();
      if (data.apps) {
        setAvailableTools(data.apps.map((app: any) => app.app_name));
      }
    } catch (error) {
      console.error('Failed to load ACI tools:', error);
    }
  };

  const subscribeToApp = async (appName: string) => {
    try {
      const response = await fetch('/api/aci/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          appName,
          securityScheme: 'API_KEY' // Default to API_KEY, user can change later
        })
      });

      const data = await response.json();
      if (data.app) {
        setAvailableTools(prev => [...prev, appName]);
        setAciApps(prev => prev.filter(app => app.app_name !== appName));
      }
    } catch (error) {
      console.error('Failed to subscribe to app:', error);
    }
  };

  const setupAppCredentials = async (appName: string) => {
    try {
      const apiKey = prompt(`Enter your API key for ${appName}:`);
      if (!apiKey) return;

      const response = await fetch('/api/aci/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          appName,
          securityScheme: 'API_KEY',
          apiKey,
          linkedAccountOwnerId: `user-${cardId}`
        })
      });

      const data = await response.json();
      if (data.account) {
        alert(`✅ ${appName} credentials configured successfully!`);
      }
    } catch (error) {
      console.error('Failed to setup app credentials:', error);
      alert(`❌ Failed to configure ${appName} credentials`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm mb-2">Task Agent</h3>
        <p className="text-xs text-gray-600 mb-3">AI assistant to optimize and execute your task</p>

        {/* ACI Agent Status */}
        {aciAgent && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center text-xs text-green-800">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              ACI Agent Active
            </div>
          </div>
        )}

        {/* ACI Tools Management */}
        <div className="mb-3">
          <button
            onClick={() => setShowToolSelector(!showToolSelector)}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors mb-2"
          >
            {showToolSelector ? 'Hide' : 'Show'} ACI Tools
          </button>

          {showToolSelector && (
            <div className="space-y-2">
              {/* Subscribed Apps */}
              {availableTools.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Subscribed Apps:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTools.map((tool) => (
                      <div key={tool} className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        <span>{tool}</span>
                        <button
                          onClick={() => setupAppCredentials(tool)}
                          className="ml-1 text-green-600 hover:text-green-800"
                          title="Setup API Key"
                        >
                          🔑
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Apps to Subscribe */}
              {aciApps.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Available Apps:</p>
                  <div className="flex flex-wrap gap-1">
                    {aciApps.slice(0, 6).map((app) => (
                      <button
                        key={app.app_name}
                        onClick={() => subscribeToApp(app.app_name)}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors"
                        title={app.description || app.app_name}
                      >
                        + {app.app_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
