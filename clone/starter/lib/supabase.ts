import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anonKey);

export type JobProvider = 'dust' | 'openai' | 'aci';

export async function logJob(opts: {
	provider: JobProvider;
	status: 'queued' | 'running' | 'succeeded' | 'failed';
	job_id: string;
	card_id?: string;
	payload?: unknown;
	result?: unknown;
	knowledge?: unknown;
}) {
	const { error } = await supabase.from('jobs').insert({
		provider: opts.provider,
		status: opts.status,
		job_id: opts.job_id,
		card_id: opts.card_id ?? null,
		payload: opts.payload ?? null,
		result: opts.result ?? null,
		knowledge: opts.knowledge ?? null,
	});
	if (error) console.error('supabase logJob error', error);
}

export async function upsertCard(card: { id: string; title: string; listId: string; position: number; description?: string | null }) {
	const { error } = await supabase.from('cards').upsert({
		id: card.id,
		title: card.title,
		list_id: card.listId,
		position: card.position,
		description: card.description ?? null,
	});
	if (error) console.error('supabase upsertCard error', error);
}

