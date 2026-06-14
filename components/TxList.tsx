"use client";
import { useEffect, useState } from "react";
import { hyperionConfigured, getHealth, getActions } from "@/lib/hyperion";

const FILTERS: { label: string; filter?: string }[] = [
  { label: "All" },
  { label: "Transfers", filter: "*:transfer" },
  { label: "Account", filter: "pulse:newaccount" },
  { label: "RAM", filter: "pulse:buyram" },
  { label: "Producer", filter: "pulse:regproducer" },
  { label: "Vote", filter: "pulse:voteproducer" },
];

export default function TxList() {
  const [state, setState] = useState<"checking" | "off" | "on">("checking");
  const [actions, setActions] = useState<any[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hyperionConfigured()) {
      setState("off");
      return;
    }
    getHealth().then((h) => setState(h ? "on" : "off"));
  }, []);

  useEffect(() => {
    if (state !== "on") return;
    setLoading(true);
    const params: Record<string, any> = { limit: 50, sort: "desc" };
    if (FILTERS[active].filter) params.filter = FILTERS[active].filter;
    getActions(params)
      .then((r: any) => setActions(r?.actions || []))
      .catch(() => setActions([]))
      .finally(() => setLoading(false));
  }, [state, active]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-white/45 text-sm">Recent actions across the chain</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f, i) => (
          <button key={f.label} onClick={() => setActive(i)} className={i === active ? "pill-btn-on" : "pill-btn"}>
            {f.label}
          </button>
        ))}
      </div>

      {state === "checking" && <div className="glass-card text-white/40 text-sm">Checking history service…</div>}

      {state === "off" && (
        <div className="glass-card text-center py-14 px-6">
          <div className="text-4xl mb-3 opacity-80">🧭</div>
          <h2 className="text-lg font-semibold mb-1.5">History indexing — coming soon</h2>
          <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
            The Hyperion history indexer isn’t live on this node yet. Block-level data, account state and the contract
            browser all work today via JSON-RPC. The full transaction stream — with category, contract and memo filters —
            lights up automatically the moment Hyperion comes online.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warn/15 px-3 py-1 text-xs text-warn">
            <span className="w-1.5 h-1.5 rounded-full bg-warn animate-beat" />
            indexer offline
          </div>
        </div>
      )}

      {state === "on" && (
        <div className="card">
          {loading ? (
            <div className="px-4 py-8 text-center text-white/40 text-sm">Loading…</div>
          ) : actions.length ? (
            <table className="w-full text-sm">
              <thead className="text-white/40 text-left text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2 font-medium">Action</th>
                  <th className="px-4 py-2 font-medium">Contract</th>
                  <th className="px-4 py-2 font-medium">Data</th>
                  <th className="px-4 py-2 font-medium">Tx</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((a, i) => (
                  <tr key={i} className="border-t border-line hover:bg-white/5">
                    <td className="px-4 py-2"><span className="chip bg-accent/20 text-accent">{a.act?.name}</span></td>
                    <td className="px-4 py-2 mono text-white/60">{a.act?.account}</td>
                    <td className="px-4 py-2 mono text-xs text-white/50 max-w-xs truncate">{JSON.stringify(a.act?.data)}</td>
                    <td className="px-4 py-2 mono text-xs">
                      <a className="text-accent" href={`/tx/${a.trx_id}`}>{String(a.trx_id).slice(0, 10)}…</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-8 text-center text-white/40 text-sm">No actions found for this filter.</div>
          )}
        </div>
      )}
    </div>
  );
}
