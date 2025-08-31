import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createAppConfiguration, getAppDetails } from '@/lib/aci';

// GET - List app configurations for a card
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

// POST - Subscribe card to ACI app
export async function POST(request: NextRequest) {
  try {
    const { cardId, appName, securityScheme } = await request.json();

    if (!cardId || !appName || !securityScheme) {
      return NextResponse.json({
        error: 'cardId, appName, and securityScheme are required'
      }, { status: 400 });
    }

    // Get app details from ACI
    const appDetails = await getAppDetails(appName);

    // Create app configuration in ACI
    const aciConfig = await createAppConfiguration(cardId, appName, securityScheme);

    // Store in our database
    const { data, error } = await supabase
      .from('aci_app_configurations')
      .insert({
        card_id: cardId,
        app_name: appName,
        app_category: appDetails.category,
        security_scheme: securityScheme,
        configuration: aciConfig
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ app: data });
  } catch (error) {
    console.error('Failed to subscribe to ACI app:', error);
    return NextResponse.json({ error: 'Failed to subscribe to app' }, { status: 500 });
  }
}

// DELETE - Unsubscribe from ACI app
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const appName = searchParams.get('appName');

    if (!cardId || !appName) {
      return NextResponse.json({ error: 'cardId and appName are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('aci_app_configurations')
      .update({ is_active: false })
      .eq('card_id', cardId)
      .eq('app_name', appName);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to unsubscribe from ACI app:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
