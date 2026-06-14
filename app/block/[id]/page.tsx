import { getBlock } from "@/lib/rpc";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

function txId(t: any): string {
  if (typeof t.trx === "string") return t.trx;
  return t.trx?.id || "";
}

export default async function Block({ params }: { params: { id: string } }) {
  let b: any, err = "";
  try {
    b = await getBlock(params.id);
  } catch (e: any) {
    err = e.message || String(e);
  }
  if (err)
    return (
      <EmptyState icon="🧱" title={`Block “${params.id}” not found`}>
        Couldn’t load that block from the RPC. ({err})
      </EmptyState>
    );

  const txns: any[] = b.transactions || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Block #{b.block_num}</h1>
        <a href={`/block/${b.block_num - 1}`} className="pill-btn">← prev</a>
        <a href={`/block/${b.block_num + 1}`} className="pill-btn">next →</a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4"><div className="text-xs text-white/40">Producer</div><div className="mono">{b.producer}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Time</div><div className="mono text-sm">{b.timestamp}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Transactions</div><div className="font-semibold">{txns.length}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Confirmed</div><div>{b.confirmed ?? 0}</div></div>
      </div>

      <div className="card p-4">
        <div className="text-xs text-white/40 mb-1">Block ID</div>
        <div className="mono text-xs break-all">{b.id}</div>
        <div className="text-xs text-white/40 mt-3 mb-1">Previous</div>
        <a className="mono text-xs break-all text-accent" href={`/block/${b.block_num - 1}`}>{b.previous}</a>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-line font-semibold">Transactions</div>
        {txns.length ? (
          <table className="w-full text-sm">
            <thead className="text-white/40 text-left text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 font-medium">Transaction ID</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">CPU µs</th>
                <th className="px-4 py-2 font-medium">NET words</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t, i) => {
                const id = txId(t);
                return (
                  <tr key={i} className="border-t border-line hover:bg-white/5">
                    <td className="px-4 py-2 mono text-xs break-all">
                      {id ? <a className="text-accent" href={`/tx/${id}`}>{id}</a> : <span className="text-white/40">—</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`chip ${t.status === "executed" ? "bg-success/15 text-success" : "bg-warn/15 text-warn"}`}>
                        {t.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white/60">{t.cpu_usage_us ?? "—"}</td>
                    <td className="px-4 py-2 text-white/60">{t.net_usage_words ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-8 text-center text-white/40 text-sm">Empty block — no transactions.</div>
        )}
      </div>
    </div>
  );
}
