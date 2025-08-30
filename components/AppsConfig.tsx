'use client';

import React, { useEffect, useState } from 'react';

export default function AppsConfig({ cardId }: { cardId: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/card-apps?cardId=${cardId}`);
      const json = await res.json();
      setApps(json.apps ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [cardId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/aci/suggest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId }) });
        const json = await res.json();
        setSuggestions((json.apps ?? []).map((a: any) => a.app_name));
      } catch {}
    })();
  }, [cardId]);

  async function saveACI(app: string, fields: Record<string,string>) {
    await fetch('/api/card-apps', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId, provider: 'aci', appId: app, config: fields }) });
    await load();
  }

  const aciApps = apps.filter(a => a.provider === 'aci');

  return (
    <div className="space-y-3 text-sm">
      {suggestions.length > 0 && (
        <div className="rounded border p-2">
          <div className="mb-1 text-xs text-gray-500">Suggested ACI apps for this task:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const saved = aciApps.find((a) => a.app_id === s);
              return (
                <div key={s} className="flex items-center gap-2 rounded border px-2 py-1">
                  <span>{s}</span>
                  {!saved ? (
                    <>
                      <input className="rounded border px-2 py-0.5 text-xs" placeholder={`${s} API key (if needed)`} id={`aci_${s}_key`} />
                      <button className="rounded bg-gray-800 px-2 py-0.5 text-xs text-white" onClick={() => saveACI(s, { apiKey: (document.getElementById(`aci_${s}_key`) as HTMLInputElement)?.value || '' })}>Link</button>
                    </>
                  ) : (
                    <span className="text-xs text-green-700">Linked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {loading && <div className="text-xs text-gray-500">Loading…</div>}
    </div>
  );
}

