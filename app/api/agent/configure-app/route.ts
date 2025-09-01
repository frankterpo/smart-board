import { NextRequest, NextResponse } from 'next/server';
import { configureACIApp, getOrCreateCardAgent, addMemory } from '@/lib/card-agent';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { cardId, appName, userInstructions } = await request.json();

    if (!cardId || !appName) {
      return NextResponse.json({ error: 'cardId and appName are required' }, { status: 400 });
    }

    // Get card agent
    const { data: card } = await supabase
      .from('cards')
      .select('title, description')
      .eq('id', cardId)
      .single();

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const agent = await getOrCreateCardAgent(cardId, card.title, card.description);

    // Configure ACI app through agent
    const result = await configureACIApp(cardId, appName, userInstructions);

    // Store configuration result
    await addMemory(cardId, `Configured ${appName}: ${result.message}`, 'app_config', {
      appName,
      success: result.success,
      configuration: result.configuration
    });

    // If successful, create app configuration record
    if (result.success) {
      await supabase.from('aci_app_configurations').insert({
        card_id: cardId,
        app_name: appName,
        app_category: result.configuration?.category || 'unknown',
        security_scheme: 'API_KEY',
        configuration: result.configuration
      });
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      configuration: result.configuration,
      agent: {
        id: agent.id,
        name: agent.name
      }
    });

  } catch (error) {
    console.error('App configuration error:', error);
    return NextResponse.json(
      { error: 'Failed to configure app', details: error.message },
      { status: 500 }
    );
  }
}

// GET - List configured apps for a card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('aci_app_configurations')
      .select('*')
      .eq('card_id', cardId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ apps: data });
  } catch (error) {
    console.error('Failed to get app configurations:', error);
    return NextResponse.json({ error: 'Failed to get apps' }, { status: 500 });
  }
}
