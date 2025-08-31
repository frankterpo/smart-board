import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { linkAccount } from '@/lib/aci';

// GET - List linked accounts for a card
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('aci_linked_accounts')
      .select('id, app_name, security_scheme, is_active, created_at')
      .eq('card_id', cardId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ accounts: data });
  } catch (error) {
    console.error('Failed to get linked accounts:', error);
    return NextResponse.json({ error: 'Failed to get accounts' }, { status: 500 });
  }
}

// POST - Link account/API key for ACI app
export async function POST(request: NextRequest) {
  try {
    const { cardId, appName, securityScheme, apiKey, linkedAccountOwnerId } = await request.json();

    if (!cardId || !appName || !securityScheme) {
      return NextResponse.json({
        error: 'cardId, appName, and securityScheme are required'
      }, { status: 400 });
    }

    const ownerId = linkedAccountOwnerId || `user-${cardId}`;

    // Check if account already exists
    const { data: existing } = await supabase
      .from('aci_linked_accounts')
      .select('*')
      .eq('card_id', cardId)
      .eq('app_name', appName)
      .eq('linked_account_owner_id', ownerId)
      .single();

    if (existing) {
      return NextResponse.json({ account: existing });
    }

    // Link account with ACI
    const aciResult = await linkAccount(cardId, appName, ownerId, securityScheme, apiKey);

    // Store in our database (encrypt API key in production)
    const { data, error } = await supabase
      .from('aci_linked_accounts')
      .insert({
        card_id: cardId,
        app_name: appName,
        linked_account_owner_id: ownerId,
        security_scheme: securityScheme,
        credentials: apiKey ? { api_key: apiKey } : null,
        oauth_state: securityScheme === 'OAUTH2' ? aciResult : null
      })
      .select()
      .single();

    if (error) throw error;

    // Return OAuth URL if needed
    const response = { account: data };
    if (securityScheme === 'OAUTH2' && typeof aciResult === 'string') {
      response.oauthUrl = aciResult;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to link account:', error);
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
  }
}

// DELETE - Remove linked account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const appName = searchParams.get('appName');

    if (!cardId || !appName) {
      return NextResponse.json({ error: 'cardId and appName are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('aci_linked_accounts')
      .update({ is_active: false })
      .eq('card_id', cardId)
      .eq('app_name', appName);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove linked account:', error);
    return NextResponse.json({ error: 'Failed to remove account' }, { status: 500 });
  }
}
