import { NextRequest } from 'next/server';
import { z } from 'zod';
import { runAciJob, runDustJob, runOpenAIJob } from '@/lib/providers';

const Body = z.object({
  cardId: z.string(),
  provider: z.enum(['openai','dust','aci']),
  prompt: z.string().optional(),
  credentials: z.object({ openaiKey: z.string().optional(), dustKey: z.string().optional(), dustWorkspaceId: z.string().optional(), aciKey: z.string().optional() }).optional()
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { cardId, provider, prompt, credentials } = Body.parse(json);
  if (provider === 'openai') await runOpenAIJob(cardId, prompt ?? '', credentials);
  if (provider === 'dust') await runDustJob(cardId, { instruction: prompt ?? '' }, credentials);
  if (provider === 'aci') await runAciJob(cardId, { tool: 'default', input: { prompt } }, credentials);
  return Response.json({ ok: true });
}

