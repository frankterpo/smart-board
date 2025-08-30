import { NextRequest } from 'next/server';
import { z } from 'zod';
import { logJob } from '@/lib/supabase';

const Body = z.object({
	provider: z.enum(['dust', 'openai', 'aci']),
	status: z.enum(['queued', 'running', 'succeeded', 'failed']).default('queued'),
	job_id: z.string(),
	card_id: z.string().optional(),
	payload: z.any().optional(),
	result: z.any().optional(),
});

export async function POST(req: NextRequest) {
	const json = await req.json();
	const body = Body.parse(json);
	await logJob(body);
	return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
}

