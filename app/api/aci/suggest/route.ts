import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  const { cardId } = await req.json();
  if (!cardId) return new Response(JSON.stringify({ error: 'cardId required' }), { status: 400 });

  const { data: card } = await supabase.from('cards').select('id,title,description').eq('id', cardId).maybeSingle();
  if (!card) return new Response(JSON.stringify({ error: 'card not found' }), { status: 404 });

  // Derive intent with OpenAI
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const intentMsg = `Given task title and description, produce a concise intent for tools selection. Title: ${card.title}. Description: ${card.description ?? ''}. Output as short phrase.`;
  const intentRes = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: intentMsg }] });
  const intent = intentRes.choices[0]?.message?.content?.trim() || `${card.title}`;

  const aciKey = process.env.ACI_API_KEY;
  if (!aciKey) {
    return new Response(JSON.stringify({
      error: 'ACI API key is required but not configured. Please add your ACI API key in admin settings.'
    }), { status: 400 });
  }

  let aciApps: Array<{ app_name: string; reason?: string }> = [];

  try {
    // REQUIRED: ACI API call - no fallback to OpenAI
    const res = await fetch('https://api.aci.dev/apps/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${aciKey}` },
      body: JSON.stringify({ intent, limit: 10, include_functions: false }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({
        error: `ACI API error: ${res.status} ${res.statusText}`
      }), { status: res.status });
    }

    const json = await res.json();
    aciApps = (json?.apps ?? []).map((a: any) => ({ app_name: a.app_name || a.app || a.name }));

    // If no apps found, return error instead of fallback
    if (aciApps.length === 0) {
      return new Response(JSON.stringify({
        error: 'No ACI apps found for this intent. Try refining your task description.'
      }), { status: 404 });
    }

  } catch (error) {
    return new Response(JSON.stringify({
      error: `Failed to connect to ACI API: ${error instanceof Error ? error.message : 'Unknown error'}`
    }), { status: 500 });
  }

  return Response.json({ intent, apps: aciApps });
}


