"use client";
import { useEffect, useState } from "react";
import { hyperionConfigured, getActions } from "@/lib/hyperion";

function summarize(act: any): string {
  const d = act?.data || {};
  if (act?.name === "transfer") return `${d.from} → ${d.to}  ${d.quantity}${d.memo ? ` · ${d.memo}` : ""}`;
  if (act?.name === "newaccount") return `created ${d.name || d.newact || ""}`;
  if (act?.name === "updateauth") return `@${d.permission} ${d.account ? `on ${d.account}` : ""}`;
  if (act?.name === "delegatebw") return `stake ${d.stake_cpu_quantity || ""} cpu / ${d.stake_net_quantity || ""} net`;
  try { const s = JSON.stringify(d); return s.length > 80 ? s.slice(0, 80) + "…" : s; } catch { return ""; }
}

export default function AccountActivity({ account }: { account: string }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!hyperionConfigured()) { setErr("Activity needs Hyperion (get_actions), not configured for this network."); return; }
    (async () => {
      try {
        const r: any = await getActions({ account, limit: 40, sort: "desc" });
        setRows(r?.actions || []);
      } catch { setErr("Hyperion unavailable or still syncing — try again shortly."); }
    })();
  }, [account]);

  if (err) return <p className="text-white/45 text-sm py-4 text-center">{err}</p>;
  if (!rows) return <p className="text-white/40 text-sm py-4 text-center">Loading activity…</p>;
  if (rows.length === 0) return <p className="text-white/45 text-sm py-4 text-center">No on-chain activity yet.</p>;

  return (
    <div className="space-y-1.5">
      {rows.map((a, i) => {
        const act = a.act || {};
        const id = a.trx_id || a.trxId || "";
        return (
          <a key={`${id}-${a.global_sequence || i}`} href={id ? `/tx/${id}` : undefined}
            className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 hover:border-accent/40 transition-colors">
            <span className="chip bg-accent/15 text-accent mono shrink-0">{act.account}::{act.name}</span>
            <span className="flex-1 min-w-0 text-sm text-white/70 mono truncate">{summarize(act)}</span>
            <span className="text-xs text-white/35 shrink-0 tabular-nums">{(a.timestamp || a["@timestamp"] || "").replace("T", " ").slice(5, 19)}</span>
          </a>
        );
      })}
    </div>
  );
}
