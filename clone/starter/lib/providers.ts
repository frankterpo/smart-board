import OpenAI from 'openai';
import { DustAPI } from '@dust-tt/client';
import { logJob } from './supabase';

type Overrides = { openaiKey?: string; dustKey?: string; dustWorkspaceId?: string; aciKey?: string };

function getOpenAI(over?: Overrides) {
  return new OpenAI({ apiKey: over?.openaiKey || process.env.OPENAI_API_KEY });
}

function getDust(over?: Overrides) {
  return new DustAPI(over?.dustKey || process.env.DUST_API_KEY!, over?.dustWorkspaceId || process.env.DUST_WORKSPACE_ID!);
}

export async function runOpenAIJob(cardId: string, prompt: string, over?: Overrides) {
	const jobId = `openai_${Date.now()}`;
	await logJob({ provider: 'openai', status: 'queued', job_id: jobId, card_id: cardId, payload: { prompt } });
	try {
		await logJob({ provider: 'openai', status: 'running', job_id: jobId, card_id: cardId });
		const client = getOpenAI(over);
		const res = await client.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }] });
		await logJob({ provider: 'openai', status: 'succeeded', job_id: jobId, card_id: cardId, result: res });
		return res;
	} catch (err) {
		await logJob({ provider: 'openai', status: 'failed', job_id: jobId, card_id: cardId, result: { error: String(err) } });
		throw err;
	}
}

export async function runDustJob(cardId: string, spec: { instruction: string }, over?: Overrides) {
	const jobId = `dust_${Date.now()}`;
	await logJob({ provider: 'dust', status: 'queued', job_id: jobId, card_id: cardId, payload: spec });
	try {
		await logJob({ provider: 'dust', status: 'running', job_id: jobId, card_id: cardId });
		const client = getDust(over);
		// Example lightweight call; replace with your workflow
		const res = await client.spaces.list();
		await logJob({ provider: 'dust', status: 'succeeded', job_id: jobId, card_id: cardId, result: res });
		return res;
	} catch (err) {
		await logJob({ provider: 'dust', status: 'failed', job_id: jobId, card_id: cardId, result: { error: String(err) } });
		throw err;
	}
}

export async function runAciJob(cardId: string, request: { tool: string; input: unknown }, _over?: Overrides) {
	const jobId = `aci_${Date.now()}`;
	await logJob({ provider: 'aci', status: 'queued', job_id: jobId, card_id: cardId, payload: request });
	try {
		await logJob({ provider: 'aci', status: 'running', job_id: jobId, card_id: cardId });
		// TODO: call ACI.dev API; keep placeholder result for now
		const res = { ok: true };
		await logJob({ provider: 'aci', status: 'succeeded', job_id: jobId, card_id: cardId, result: res });
		return res;
	} catch (err) {
		await logJob({ provider: 'aci', status: 'failed', job_id: jobId, card_id: cardId, result: { error: String(err) } });
		throw err;
	}
}

