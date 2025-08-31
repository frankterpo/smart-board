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

  // Get agent configurations for this workspace
  const agentsResult = await client.getAgentConfigurations();
  if (agentsResult.isErr()) {
    console.error('Dust API error:', agentsResult.error.message);
    return Response.json({ ok: true, workspace_id: ws, note: 'Dust API error' });
  }

  const activeAgents = agentsResult.value.filter(agent => agent.status === 'active');

  // Store agent configurations for this card
  await supabase.from('dust_spaces').upsert({
    card_id: cardId,
    workspace_id: ws,
    space_id: `agents_${cardId}`,
    agents: activeAgents
  });

  return Response.json({
    ok: true,
    workspace_id: ws,
    agents_count: activeAgents.length,
    agents: activeAgents.map(a => ({ name: a.name, sId: a.sId }))
  });
}


