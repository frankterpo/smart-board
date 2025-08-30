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
  let aciApps: Array<{ app_name: string; reason?: string }> = [];
  if (aciKey) {
    try {
      // Best-effort call: if ACI REST endpoint available
      const res = await fetch('https://api.aci.dev/apps/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${aciKey}` },
        body: JSON.stringify({ intent, limit: 10, include_functions: false }),
      });
      if (res.ok) {
        const json = await res.json();
        aciApps = (json?.apps ?? []).map((a: any) => ({ app_name: a.app_name || a.app || a.name }));
      }
    } catch {}
  }

  // Fallback: use OpenAI to suggest app names heuristically
  if (aciApps.length === 0) {
    const suggestMsg = `List up to 5 likely ACI app names (uppercase snake case, e.g., BRAVE_SEARCH, GMAIL) relevant to: ${intent}. Respond as comma-separated list.`;
    const sres = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: suggestMsg }] });
    const text = sres.choices[0]?.message?.content || '';
    aciApps = text.split(',').map((t) => ({ app_name: t.trim().toUpperCase().replace(/\s+/g, '_') })).filter((a) => a.app_name);
  }

  return Response.json({ intent, apps: aciApps });
}

