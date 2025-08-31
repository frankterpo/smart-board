import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { cardId, message, provider, history, availableTools, cardContext } = await request.json();

    let response = '';
    let reasoning = '';
    let metadata = {};

    switch (provider) {
      case 'openai':
        // Use OpenAI Chat Completions with reasoning
        const systemPrompt = `You are a task optimization AI assistant integrated into a smart Kanban board.

Your role is to help users create, refine, and execute tasks effectively.

Current Task Context:
- Title: "${cardContext?.title || 'No title'}"
- Description: "${cardContext?.description || 'No description'}"
- Available Tools: ${availableTools?.length > 0 ? availableTools.join(', ') : 'ACI tools not configured - please add ACI API key in admin settings'}

Your capabilities:
1. **Task Analysis**: Analyze tasks for clarity, specificity, and executability
2. **Improvement Suggestions**: Suggest better titles, descriptions, or approaches
3. **Tool Recommendations**: Recommend ACI tools when available for enhanced functionality
4. **Execution Guidance**: Guide users through task completion
5. **Change Proposals**: When suggesting changes, propose them clearly and ask for approval

Guidelines:
- Always provide reasoning for your suggestions
- Be proactive in identifying potential improvements
- Respect user approval for changes
- Focus on making tasks more actionable and successful
- Use ACI tools when available to provide better automation options
- If ACI tools are not configured, suggest adding the ACI API key for full functionality

If you have suggestions for improving the task, present them clearly with reasoning.`;

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
        let proposedChanges = {};

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

        // Check if the response contains suggestions for changes
        const suggestionKeywords = ['suggest', 'recommend', 'improve', 'change', 'better'];
        const hasSuggestions = suggestionKeywords.some(keyword =>
          response.toLowerCase().includes(keyword)
        );

        if (hasSuggestions && (cardContext?.title || cardContext?.description)) {
          // Generate specific improvement suggestions
          const improvementPrompt = `Based on the following task and assistant response, suggest specific improvements to the title and/or description.

Current Task:
- Title: "${cardContext?.title || 'No title'}"
- Description: "${cardContext?.description || 'No description'}"
- Assistant Response: "${response}"

If improvements are needed, respond with JSON:
{
  "title": "improved title or null",
  "description": "improved description or null"
}

If no improvements needed, respond with: {}`;

          try {
            const improvementCompletion = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [{ role: 'user', content: improvementPrompt }],
              max_tokens: 300,
              temperature: 0.5,
            });

            const improvementResponse = improvementCompletion.choices[0]?.message?.content || '{}';
            const improvements = JSON.parse(improvementResponse);

            if (Object.keys(improvements).length > 0) {
              proposedChanges = improvements;
            }
          } catch (error) {
            console.log('Could not generate improvement suggestions:', error);
          }
        }

        metadata = { model: 'gpt-4', usage: completion.usage, reasoning, proposedChanges };
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
      provider,
      proposedChanges
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
