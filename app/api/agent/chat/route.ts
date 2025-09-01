import { NextRequest, NextResponse } from 'next/server';
import { chatWithAgent, getOrCreateCardAgent, retrieveMemories } from '@/lib/card-agent';

export async function POST(request: NextRequest) {
  try {
    const { cardId, message, conversationHistory = [] } = await request.json();

    if (!cardId || !message) {
      return NextResponse.json({ error: 'cardId and message are required' }, { status: 400 });
    }

    // Get or create card agent
    const { data: card } = await import('@/lib/supabase').then(({ supabase }) =>
      supabase.from('cards').select('title, description').eq('id', cardId).single()
    );

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const agent = await getOrCreateCardAgent(cardId, card.title, card.description);

    // Get relevant memories for context
    const memories = await retrieveMemories(cardId, message);

    // Generate AI response
    const result = await chatWithAgent(cardId, message, conversationHistory);

    return NextResponse.json({
      response: result.response,
      suggestedActions: result.suggestedActions || [],
      agent: {
        id: agent.id,
        name: agent.name,
        capabilities: agent.capabilities
      },
      memories: {
        used: memories.length,
        recent: memories.slice(0, 3).map(m => ({
          content: m.content.substring(0, 100) + '...',
          type: m.contentType,
          createdAt: m.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}
