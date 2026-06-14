import { getTableRows, SYSTEM } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata = { title: "Producers — Pulse Explorer" };

export default async function Page() {
  let rows: any[] = [];
  try {
    const r = await getTableRows({
      code: SYSTEM,
      scope: SYSTEM,
      table: "producers",
      index_position: "2",
      key_type: "i64",
      reverse: true,
      limit: 50,
    });
    rows = (r?.rows || []).filter((p: any) => p.is_active !== 0);
  } catch {
    rows = [];
  }

  const totalVotes = rows.reduce((s, p) => s + Number(p.total_votes || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Block Producers</h1>
        <p className="text-white/45 text-sm">Validator leaderboard by vote weight</p>
      </div>

      {rows.length ? (
        <div className="card">
          <table className="w-full text-sm">
            <thead className="text-white/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Producer</th>
                <th className="px-4 py-2 font-medium">Votes</th>
                <th className="px-4 py-2 font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => {
                const share = totalVotes ? (Number(p.total_votes) / totalVotes) * 100 : 0;
                return (
                  <tr key={p.owner} className="border-t border-line hover:bg-white/5">
                    <td className="px-4 py-2 text-white/40">{i + 1}</td>
                    <td className="px-4 py-2">
                      <a className="mono text-accent" href={`/account/${p.owner}`}>{p.owner}</a>
                    </td>
                    <td className="px-4 py-2 text-white/70">{Number(p.total_votes).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-accent to-glow" style={{ width: `${Math.max(2, share)}%` }} />
                        </div>
                        <span className="text-xs text-white/50">{share.toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon="🛡️" title="Producer leaderboard not available yet" badge="awaiting system contract">
          The system contract (<span className="mono">pulse</span>) that holds the <span className="mono">producers</span> table
          isn’t deployed on this testnet yet. The validator leaderboard and voting weights appear here automatically once it is.
        </EmptyState>
      )}
    </div>
  );
}
