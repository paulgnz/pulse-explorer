import { getAccount, getCurrencyBalance } from "@/lib/rpc";
import ContractBrowser from "@/components/ContractBrowser";

export const dynamic = "force-dynamic";

export default async function Account({ params }: { params: { name: string } }) {
  let acct: any, bal: string[] = [], err = "";
  try {
    acct = await getAccount(params.name);
    bal = await getCurrencyBalance("pulse.token", params.name).catch(() => []);
  } catch (e: any) { err = e.message || String(e); }

  if (err) return (
    <div className="glass-card text-center py-12">
      <div className="text-4xl mb-3">🔍</div>
      <h1 className="text-xl font-semibold mb-1">Account <span className="mono text-accent">{params.name}</span> not found</h1>
      <p className="text-white/50 text-sm max-w-md mx-auto">It isn’t on the Pulse Testnet (yet). The 32k XPR testnet accounts are being mirrored — if this is a real XPR testnet account, check back shortly.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold mono">{acct.account_name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="card p-4"><div className="text-xs text-white/40">Balance</div><div className="text-lg font-semibold">{bal[0] || "0.0000 XPR"}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Created</div><div className="text-sm mono">{acct.created}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">RAM used</div><div className="text-sm mono">{acct.ram_usage ?? "—"}</div></div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-line font-semibold">Permissions</div>
        <div className="divide-y divide-line">
          {(acct.permissions || []).map((p: any) => (
            <div key={p.perm_name} className="px-4 py-3">
              <div className="text-sm"><span className="font-semibold">@{p.perm_name}</span>
                <span className="text-white/40"> · parent {p.parent || "—"} · threshold {p.required_auth.threshold}</span></div>
              {p.required_auth.keys.map((k: any) => (
                <div key={k.key} className="mono text-xs text-white/60 mt-1 break-all">{k.key} <span className="text-white/30">(w{k.weight})</span></div>
              ))}
              {(p.required_auth.accounts || []).map((a: any, i: number) => (
                <div key={i} className="mono text-xs text-glow mt-1">{a.permission.actor}@{a.permission.permission} (w{a.weight})</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {acct.last_code_update && acct.last_code_update !== "1970-01-01T00:00:00.000" && (
        <ContractBrowser account={acct.account_name} />
      )}
    </div>
  );
}
