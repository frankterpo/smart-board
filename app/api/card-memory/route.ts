import { NextRequest } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const Body = z.object({ cardId: z.string(), action: z.enum(['ensure','upload','search']), text: z.string().optional() });

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { cardId, action, text } = Body.parse(json);
  const { data } = await supabase.from('cards').select('vector_store_id, description, title').eq('id', cardId).maybeSingle();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let vectorStoreId = data?.vector_store_id as string | null | undefined;
  if (action === 'ensure') {
    if (!vectorStoreId) {
      const vs = await client.vectorStores.create({ name: `card:${cardId}` });
      vectorStoreId = vs.id;
      await supabase.from('cards').update({ vector_store_id: vectorStoreId }).eq('id', cardId);
    }
    return Response.json({ ok: true, vector_store_id: vectorStoreId });
  }

  if (!vectorStoreId) return new Response(JSON.stringify({ error: 'vector store missing' }), { status: 400 });

  if (action === 'upload') {
    if (!text) return new Response(JSON.stringify({ error: 'text required' }), { status: 400 });
    // Create a temporary file as a bytes stream
    const file = await client.files.create({
      file: new Blob([text], { type: 'text/plain' }) as any,
      purpose: 'assistants',
    });
    await client.vectorStores.files.createAndPoll({ vector_store_id: vectorStoreId, file_id: file.id } as any);
    return Response.json({ ok: true });
  }

  if (action === 'search') {
    const results = await client.vectorStores.search({ vector_store_id: vectorStoreId, query: text ?? '' } as any);
    return Response.json({ ok: true, results });
  }

  return Response.json({ ok: false });
}

