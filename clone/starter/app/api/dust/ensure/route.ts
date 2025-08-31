import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DustAPI } from '@dust-tt/client';
import { supabase } from '@/lib/supabase';

const Body = z.object({ boardId: z.string(), cardId: z.string().optional() });

export async function POST(req: NextRequest) {
  const { boardId, cardId } = Body.parse(await req.json());
  const client = new (DustAPI as any)({
    apiKey: process.env.DUST_API_KEY!,
    workspaceId: process.env.DUST_WORKSPACE_ID!,
    baseUrl: 'https://dust.tt'
  });

  // Ensure workspace mapping
  const ws = process.env.DUST_WORKSPACE_ID!;
  await supabase.from('dust_workspaces').upsert({ board_id: boardId, workspace_id: ws });

  if (!cardId) return Response.json({ ok: true, workspace_id: ws });

  // Ensure space for card
  const space = await client.spaces.create({ title: `card:${cardId}` });
  await supabase.from('dust_spaces').upsert({ card_id: cardId, workspace_id: ws, space_id: (space as any).id });

  // Example datasource
  const ds = await client.dataSources.create({ name: `card_${cardId}_ds` });
  await supabase.from('dust_datasources').upsert({ card_id: cardId, workspace_id: ws, space_id: (space as any).id, datasource_id: (ds as any).id });

  return Response.json({ ok: true, workspace_id: ws, space_id: (space as any).id, datasource_id: (ds as any).id });
}


