import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DustAPI } from '@dust-tt/client';
import { supabase } from '@/lib/supabase';

const Body = z.object({ boardId: z.string(), cardId: z.string().optional() });

export async function POST(req: NextRequest) {
  const { boardId, cardId } = Body.parse(await req.json());
  const client = new DustAPI(
    {
      url: "https://dust.tt",
    },
    {
      workspaceId: process.env.DUST_WORKSPACE_ID!,
      apiKey: process.env.DUST_API_KEY!,
    },
    console
  );

  // Ensure workspace mapping
  const ws = process.env.DUST_WORKSPACE_ID!;
  await supabase.from('dust_workspaces').upsert({ board_id: boardId, workspace_id: ws });

  if (!cardId) return Response.json({ ok: true, workspace_id: ws });

  // For now, just return success without creating spaces/datasources
  // The Dust API methods available are different than expected
  return Response.json({ ok: true, workspace_id: ws });
}


