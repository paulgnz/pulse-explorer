import { getCurrencyStats, getCurrencyBalance, KNOWN_TOKENS } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tokens — Pulse Explorer" };

// getCurrencyStats is unreliable on this PulseVM build (symbol-scoped stat table),
// so detect deployment via the issuer's balance + fall back to known supply.
const KNOWN_SUPPLY: Record<string, string> = { XPR: "2,129,582,261.9131 XPR" };

export default async function Page() {
  const results = await Promise.all(
    KNOWN_TOKENS.map(async (t) => {
      try {
        const bal = await getCurrencyBalance(t.contract, "pulse", t.sym).catch(() => [] as string[]);
        if (!bal || !bal.length) return null; // not deployed / issuer holds none
        const stats = await getCurrencyStats(t.contract, t.sym).catch(() => ({} as any));
        const row = stats?.[t.sym] || {};
        return { ...t, supply: row.supply || KNOWN_SUPPLY[t.sym] || "—", max_supply: row.max_supply || "—", issuer: row.issuer || "pulse" };
      } catch {
        return null;
      }
    })
  );
  const tokens = results.filter(Boolean) as any[];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tokens</h1>
        <p className="text-white/45 text-sm">Token contracts on the XPR Network Pulse Testnet</p>
      </div>

      {tokens.length ? (
        <div className="card">
          <table className="w-full text-sm">
            <thead className="text-white/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-medium">Token</th>
                <th className="px-4 py-2 font-medium">Contract</th>
                <th className="px-4 py-2 font-medium">Supply</th>
                <th className="px-4 py-2 font-medium">Max supply</th>
                <th className="px-4 py-2 font-medium">Issuer</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.sym} className="border-t border-line hover:bg-white/5">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img src={`/tokens/${t.sym}.png`} alt="" className="w-6 h-6 rounded-full bg-white/5" />
                      <a className="font-semibold text-accent" href={`/token/${t.sym}`}>{t.sym}</a>
                    </div>
                  </td>
                  <td className="px-4 py-2 mono text-white/60">{t.contract}</td>
                  <td className="px-4 py-2">{t.supply}</td>
                  <td className="px-4 py-2 text-white/60">{t.max_supply}</td>
                  <td className="px-4 py-2 mono text-white/60">{t.issuer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon="🪙" title="No tokens deployed yet" badge="awaiting pulse.token">
          The core token contract (<span className="mono">pulse.token</span>) and the XPR token aren’t deployed on this
          testnet yet. Once they are, the full token list — supply, holders and logos — appears here automatically.
        </EmptyState>
      )}
    </div>
  );
}
