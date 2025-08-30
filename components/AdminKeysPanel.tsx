'use client';

import React, { useEffect, useState } from 'react';

export default function AdminKeysPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  async function load() {
    const res = await fetch('/api/settings');
    const json = await res.json();
    setSettings(json.settings || {});
  }

  useEffect(() => { load(); }, []);

  async function save() {
    await fetch('/api/settings', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(settings) });
    setOpen(false);
  }

  return (
    <>
      <button
        aria-label="Admin settings"
        className="fixed bottom-3 left-3 z-50 rounded-full bg-black p-2 text-white shadow-lg"
        onClick={() => setOpen(true)}
      >
        🤖
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg rounded bg-white p-4" onClick={(e)=>e.stopPropagation()}>
            <h2 className="mb-3 text-lg font-semibold">Admin Keys</h2>
            <div className="space-y-2 text-sm">
              <input className="w-full rounded border px-2 py-1" placeholder="OpenAI API Key" value={settings.openai_key ?? ''} onChange={(e)=>setSettings({...settings, openai_key:e.target.value})} />
              <input className="w-full rounded border px-2 py-1" placeholder="Dust API Key" value={settings.dust_key ?? ''} onChange={(e)=>setSettings({...settings, dust_key:e.target.value})} />
              <input className="w-full rounded border px-2 py-1" placeholder="Dust Workspace ID" value={settings.dust_workspace_id ?? ''} onChange={(e)=>setSettings({...settings, dust_workspace_id:e.target.value})} />
              <input className="w-full rounded border px-2 py-1" placeholder="ACI API Key" value={settings.aci_key ?? ''} onChange={(e)=>setSettings({...settings, aci_key:e.target.value})} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-3 py-1" onClick={()=>setOpen(false)}>Cancel</button>
              <button className="rounded bg-gray-800 px-3 py-1 text-white" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

