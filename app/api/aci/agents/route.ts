import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createCardAgent } from '@/lib/aci';

// GET - List all ACI agents for a card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('aci_card_agents')
      .select('*')
      .eq('card_id', cardId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Failed to get ACI agent:', error);
    return NextResponse.json({ error: 'Failed to get agent' }, { status: 500 });
  }
}

// POST - Create or update ACI agent for a card
export async function POST(request: NextRequest) {
  try {
    const { cardId, title, description } = await request.json();

    if (!cardId || !title) {
      return NextResponse.json({ error: 'cardId and title are required' }, { status: 400 });
    }

    // Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('aci_card_agents')
      .select('*')
      .eq('card_id', cardId)
      .single();

    if (existingAgent) {
      // Update existing agent
      const { data, error } = await supabase
        .from('aci_card_agents')
        .update({
          description: `AI agent for card: ${title}`,
          intent: `${title} ${description || ''}`.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('card_id', cardId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ agent: data });
    }

    // Create new agent
    const agentData = await createCardAgent(cardId, title, description);

    const { data, error } = await supabase
      .from('aci_card_agents')
      .insert(agentData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Failed to create/update ACI agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
