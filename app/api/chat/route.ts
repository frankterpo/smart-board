import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { cardId, message, provider, history } = await request.json();

    let response = '';
    let reasoning = '';
    let metadata = {};

    switch (provider) {
      case 'openai':
        // Use OpenAI Chat Completions with reasoning
        const systemPrompt = `You are a helpful AI assistant integrated into a task management system.

Your task is to:
1. Understand the user's request and the task context
2. Provide clear reasoning about how you understand the task
3. Give a specific, actionable response
4. If applicable, suggest next steps or related tasks

Always include your reasoning process in your response, explaining how you analyzed the task and what approach you're taking.`;

        const openaiMessages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-5).map((msg: any) => ({ // Keep only last 5 messages for context
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: openaiMessages,
          max_tokens: 1500,
          temperature: 0.7,
        });

        response = completion.choices[0]?.message?.content || 'No response generated';

        // Extract reasoning if present, otherwise create a summary
        const responseParts = response.split('\n\n');
        if (responseParts.length > 1 && responseParts[0].toLowerCase().includes('reasoning')) {
          reasoning = responseParts[0];
          response = responseParts.slice(1).join('\n\n');
        } else {
          // Generate reasoning summary
          const reasoningPrompt = `Based on this task context and user message, summarize your reasoning process in 2-3 sentences:

Task Context: ${history.slice(-2).map((h: any) => h.content).join(' | ')}
User Message: ${message}
Response: ${response}

Reasoning:`;

          const reasoningCompletion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [{ role: 'user', content: reasoningPrompt }],
            max_tokens: 200,
            temperature: 0.3,
          });

          reasoning = reasoningCompletion.choices[0]?.message?.content || 'Analyzed the task and provided assistance.';
        }

        metadata = { model: 'gpt-4', usage: completion.usage, reasoning };
        break;

      case 'dust':
        // Placeholder for Dust integration
        // This would need proper Dust API integration
        response = 'Dust integration is being configured. This will provide advanced agent capabilities with persistent memory and tool orchestration.';
        metadata = { status: 'configuring' };
        break;

      case 'aci':
        // Placeholder for ACI MCP integration
        // This would need proper ACI API integration
        response = 'ACI MCP integration is being configured. This will provide access to external tools and APIs through the ACI platform.';
        metadata = { status: 'configuring' };
        break;

      default:
        response = 'Unknown provider specified.';
    }

    // Log the interaction to Supabase
    await supabase.from('chat_interactions').insert({
      card_id: cardId,
      provider,
      user_message: message,
      assistant_response: response,
      metadata,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      response,
      metadata,
      provider
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
