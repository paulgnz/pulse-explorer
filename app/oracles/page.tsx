import { getTableRows } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oracles — Pulse Explorer" };

export default async function Page() {
  let feeds: any[] = [];
  try {
    const r = await getTableRows({ code: "oracles", scope: "oracles", table: "feeds", limit: 100 });
    feeds = r?.rows || [];
  } catch {
    feeds = [];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Oracles</h1>
        <p className="text-white/45 text-sm">On-chain data feeds</p>
      </div>

      {feeds.length ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {feeds.map((f, i) => (
            <div key={f.index ?? f.name ?? i} className="glass-card !p-4">
              <div className="text-xs text-white/40 uppercase tracking-wide">{f.name || f.feed_index || `feed ${i}`}</div>
              <div className="mt-1 text-lg font-semibold mono">{f.aggregate?.d_double ?? f.price ?? "—"}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="🔮" title="No oracle feeds yet" badge="awaiting oracles contract">
          The <span className="mono">oracles</span> contract isn’t deployed on this testnet yet. Price and data feeds appear
          here automatically once it is live.
        </EmptyState>
      )}
    </div>
  );
}
