import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

const SETTINGS_ID = 'board:b1';

export async function GET() {
  const { data } = await supabase.from('settings').select('*').eq('id', SETTINGS_ID).maybeSingle();
  return Response.json({ settings: data ?? {} });
}

export async function POST(req: NextRequest) {
  const json = await req.json();
  const { error } = await supabase.from('settings').upsert({ id: SETTINGS_ID, ...json });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return Response.json({ ok: true });
}

