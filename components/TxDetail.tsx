"use client";
import { useEffect, useState } from "react";
import { hyperionConfigured, getHealth, getTransaction } from "@/lib/hyperion";

type Tab = "actions" | "traces" | "ram" | "signers" | "raw";

export default function TxDetail({ id }: { id: string }) {
  const [state, setState] = useState<"checking" | "off" | "on" | "missing">("checking");
  const [tx, setTx] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("actions");

  useEffect(() => {
    if (!hyperionConfigured()) {
      setState("off");
      return;
    }
    getHealth().then((h) => {
      if (!h) {
        setState("off");
        return;
      }
      getTransaction(id)
        .then((r: any) => {
          if (r?.actions?.length || r?.trx_id) {
            setTx(r);
            setState("on");
          } else setState("missing");
        })
        .catch(() => setState("missing"));
    });
  }, [id]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Transaction</h1>
        <div className="mono text-xs text-white/50 break-all mt-1">{id}</div>
      </div>

      {state === "checking" && <div className="glass-card text-white/40 text-sm">Decoding transaction…</div>}

      {(state === "off" || state === "missing") && (
        <div className="glass-card text-center py-14 px-6">
          <div className="text-4xl mb-3 opacity-80">🧬</div>
          <h2 className="text-lg font-semibold mb-1.5">
            {state === "missing" ? "Transaction not found in the index" : "The Decoder — coming soon"}
          </h2>
          <p className="text-white/45 text-sm max-w-md mx-auto leading-relaxed">
            {state === "missing"
              ? "This transaction id wasn’t found in the history index. It may be very recent, or on a different chain."
              : "Full transaction decoding — action-trace tree, RAM deltas, signers and raw payload — requires the Hyperion history indexer, which isn’t live on this node yet. It lights up automatically once Hyperion is online."}
          </p>
        </div>
      )}

      {state === "on" && tx && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Status" value={tx.executed === false ? "pending" : "executed"} ok />
            <Stat label="Block" value={tx.actions?.[0]?.block_num ? `#${tx.actions[0].block_num}` : "—"} />
            <Stat label="CPU µs" value={tx.cpu_usage_us ?? tx.actions?.[0]?.cpu_usage_us ?? "—"} />
            <Stat label="NET words" value={tx.net_usage_words ?? "—"} />
          </div>

          <div className="card">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-line overflow-x-auto">
              {(["actions", "traces", "ram", "signers", "raw"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 text-sm rounded-lg capitalize ${tab === t ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"}`}
                >
                  {t === "ram" ? "RAM Deltas" : t}
                </button>
              ))}
            </div>
            <div className="p-4">
              {tab === "actions" && (
                <div className="space-y-3">
                  {(tx.actions || []).map((a: any, i: number) => (
                    <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <div className="flex items-center gap-2">
                        <span className="chip bg-accent/20 text-accent">{a.act?.name}</span>
                        <span className="mono text-xs text-white/50">{a.act?.account}</span>
                      </div>
                      <pre className="mono text-xs text-white/70 mt-2 overflow-auto">{JSON.stringify(a.act?.data, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              )}
              {tab === "traces" && (
                <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-[32rem]">
                  {JSON.stringify(tx.actions?.map((a: any) => ({ receiver: a.receiver, name: a.act?.name, notified: a.notified })), null, 2)}
                </pre>
              )}
              {tab === "ram" && (
                <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-[32rem]">
                  {JSON.stringify(tx.actions?.flatMap((a: any) => a.account_ram_deltas || []), null, 2) || "No RAM deltas."}
                </pre>
              )}
              {tab === "signers" && (
                <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-[32rem]">
                  {JSON.stringify(tx.actions?.flatMap((a: any) => a.authorization || a.act?.authorization || []), null, 2)}
                </pre>
              )}
              {tab === "raw" && (
                <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-[32rem]">{JSON.stringify(tx, null, 2)}</pre>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, ok }: { label: string; value: any; ok?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`text-base font-semibold ${ok ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}
