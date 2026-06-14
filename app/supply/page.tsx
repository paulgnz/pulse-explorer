import { getCurrencyStats, TOKEN_CONTRACT, CORE_SYMBOL } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Supply — Pulse Explorer" };

const TARGET = 2_129_582_261; // XPR supply target once the token is deployed.

export default async function Page() {
  let stats: any = null;
  try {
    const r = await getCurrencyStats(TOKEN_CONTRACT, CORE_SYMBOL);
    stats = r?.[CORE_SYMBOL] || null;
  } catch {
    stats = null;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">XPR Supply</h1>
        <p className="text-white/45 text-sm">Total, circulating and staked supply of the core token</p>
      </div>

      {stats ? (
        <>
          <div className="aurora glass-card !p-7">
            <div className="text-xs uppercase tracking-wide text-white/40">Total supply</div>
            <div className="mt-1 text-4xl font-bold text-brand tabular-nums">{stats.supply}</div>
            <div className="mt-1 text-xs text-white/40">max {stats.max_supply} · issuer <span className="mono">{stats.issuer}</span></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card label="Max supply" value={stats.max_supply} />
            <Card label="Issuer" value={stats.issuer} mono />
            <Card label="Contract" value={TOKEN_CONTRACT} mono />
          </div>
        </>
      ) : (
        <>
          <div className="aurora glass-card !p-7 opacity-90">
            <div className="text-xs uppercase tracking-wide text-white/40">Target supply (post-migration)</div>
            <div className="mt-1 text-4xl font-bold text-brand tabular-nums">{TARGET.toLocaleString()} XPR</div>
            <div className="mt-1 text-xs text-white/40">mirrored from XPR Network — live figure appears once pulse.token is deployed</div>
          </div>
          <EmptyState icon="📊" title="Live supply not available yet" badge="awaiting pulse.token">
            The XPR token contract isn’t deployed on this testnet yet. The supply target above is the migration goal; the
            live total / circulating / staked breakdown lights up automatically once <span className="mono">pulse.token</span> is on-chain.
          </EmptyState>
        </>
      )}
    </div>
  );
}

function Card({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`text-base font-semibold break-all ${mono ? "mono text-sm" : ""}`}>{value}</div>
    </div>
  );
}
