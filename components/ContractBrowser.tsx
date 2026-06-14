"use client";
import { useEffect, useState } from "react";
import { getAbi, getTableRows, RPC } from "@/lib/rpc";

type Tab = "tables" | "actions" | "abi";

export default function ContractBrowser({ account }: { account: string }) {
  const [abi, setAbi] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("tables");
  const [err, setErr] = useState("");

  // table state
  const [table, setTable] = useState("");
  const [scope, setScope] = useState(account);
  const [limit, setLimit] = useState("50");
  const [rows, setRows] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // action state
  const [action, setAction] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    getAbi(account).then((r) => setAbi(r?.abi || r)).catch((e) => setErr(String(e.message || e)));
  }, [account]);

  if (err) return <div className="glass-card text-white/50 text-sm">No ABI / not a contract: {err}</div>;
  if (!abi) return <div className="glass-card text-white/40 text-sm">Loading contract…</div>;

  const tables: any[] = abi.tables || [];
  const actions: any[] = abi.actions || [];
  const structs: any[] = abi.structs || [];
  const structFor = (name: string) => structs.find((s) => s.name === name);

  async function query() {
    setLoading(true); setRows(null);
    try { setRows(await getTableRows({ code: account, scope: scope || account, table, limit: +limit || 50 })); }
    catch (e: any) { setRows({ error: e.message }); }
    setLoading(false);
  }

  function selectAction(a: any) {
    setAction(a);
    const st = structFor(a.type);
    const f: Record<string, string> = {};
    (st?.fields || []).forEach((fl: any) => (f[fl.name] = ""));
    setForm(f);
  }

  function submit() {
    // Hand off to the Pulse Wallet for signing via the pulsevm:// scheme.
    const act = { account, name: action.name, authorization: [{ actor: "<your-account>", permission: "active" }], data: form };
    const payload = btoa(JSON.stringify({ actions: [act], rpc: RPC }));
    window.location.href = `pulsevm://sign?tx=${payload}`;
  }

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button onClick={() => setTab(id)}
      className={`px-3 py-1.5 text-sm rounded-lg ${tab === id ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"}`}>{label}</button>
  );

  return (
    <div className="glass-card">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-semibold mr-2">Contract</h2>
        <TabBtn id="tables" label={`Tables (${tables.length})`} />
        <TabBtn id="actions" label={`Actions (${actions.length})`} />
        <TabBtn id="abi" label="ABI" />
      </div>

      {tab === "tables" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <button key={t.name} onClick={() => setTable(t.name)}
                className={`rounded-lg border px-3 py-1.5 text-sm mono ${table === t.name ? "border-accent text-accent" : "border-white/15 text-white/70 hover:border-white/30"}`}>{t.name}</button>
            ))}
          </div>
          {table && (
            <>
              <div className="flex flex-wrap gap-2 items-end">
                <label className="text-xs text-white/50">Scope<input value={scope} onChange={(e) => setScope(e.target.value)} className="pulse-field block mt-1 px-2 py-1.5 text-sm mono w-48" /></label>
                <label className="text-xs text-white/50">Limit<input value={limit} onChange={(e) => setLimit(e.target.value)} className="pulse-field block mt-1 px-2 py-1.5 text-sm mono w-24" /></label>
                <button onClick={query} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium">{loading ? "…" : "Query"}</button>
              </div>
              {rows && <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-96">{JSON.stringify(rows.rows ?? rows, null, 2)}</pre>}
            </>
          )}
        </div>
      )}

      {tab === "actions" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
              <button key={a.name} onClick={() => selectAction(a)}
                className={`rounded-lg border px-3 py-1.5 text-sm mono ${action?.name === a.name ? "border-accent text-accent" : "border-white/15 text-white/70 hover:border-white/30"}`}>{a.name}</button>
            ))}
          </div>
          {action && (
            <div className="space-y-2">
              {(structFor(action.type)?.fields || []).map((fl: any) => (
                <label key={fl.name} className="block text-xs text-white/50">{fl.name} <span className="text-white/30">({fl.type})</span>
                  <input value={form[fl.name] || ""} onChange={(e) => setForm({ ...form, [fl.name]: e.target.value })}
                    className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" placeholder={fl.type} /></label>
              ))}
              <button onClick={submit} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium mt-2">Submit via Pulse Wallet →</button>
              <p className="text-xs text-white/40">Opens the Pulse Wallet (pulsevm://) to review &amp; sign. Login/WebAuth in-page coming next.</p>
            </div>
          )}
        </div>
      )}

      {tab === "abi" && (
        <pre className="mono text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-[32rem]">{JSON.stringify(abi, null, 2)}</pre>
      )}
    </div>
  );
}
