import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const GetQuery = z.object({ cardId: z.string() });
const UpsertBody = z.object({ cardId: z.string(), provider: z.enum(['dust','openai','aci']), appId: z.string(), config: z.any().optional() });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get('cardId') || '';
  const { cardId: id } = GetQuery.parse({ cardId });
  const { data, error } = await supabase.from('card_apps').select('*').eq('card_id', id);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return Response.json({ apps: data });
}

export async function POST(req: NextRequest) {
  const body = UpsertBody.parse(await req.json());
  const { error } = await supabase.from('card_apps').upsert({ card_id: body.cardId, provider: body.provider, app_id: body.appId, config: body.config ?? null });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return Response.json({ ok: true });
}


