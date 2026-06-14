import { getCurrencyStats, KNOWN_TOKENS } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { sym: string } }) {
  const sym = params.sym.toUpperCase();
  const known = KNOWN_TOKENS.find((t) => t.sym === sym);
  const contract = known?.contract || "pulse.token";

  let stats: any = null;
  try {
    const r = await getCurrencyStats(contract, sym);
    stats = r?.[sym] || null;
  } catch {
    stats = null;
  }

  if (!stats)
    return (
      <EmptyState icon="🪙" title={`Token ${sym} not available`} badge="awaiting deployment">
        Couldn’t read stats for <span className="mono">{sym}</span> from <span className="mono">{contract}</span>. The
        contract may not be deployed on this testnet yet.
      </EmptyState>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <img src={`/tokens/${sym}.png`} alt="" className="w-12 h-12 rounded-full bg-white/5" />
        <div>
          <h1 className="text-2xl font-bold">{sym}</h1>
          <div className="text-xs text-white/45 mono">{contract}</div>
        </div>
      </div>
      <div className="aurora glass-card !p-7">
        <div className="text-xs uppercase tracking-wide text-white/40">Supply</div>
        <div className="mt-1 text-4xl font-bold text-brand tabular-nums">{stats.supply}</div>
        <div className="mt-1 text-xs text-white/40">max {stats.max_supply}</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card p-4"><div className="text-xs text-white/40">Max supply</div><div className="font-semibold">{stats.max_supply}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Issuer</div><div className="font-semibold mono"><a className="text-accent" href={`/account/${stats.issuer}`}>{stats.issuer}</a></div></div>
      </div>
    </div>
  );
}
