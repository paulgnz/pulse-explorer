import { getBlock } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function Block({ params }: { params: { id: string } }) {
  let b: any, err = "";
  try { b = await getBlock(params.id); } catch (e: any) { err = e.message || String(e); }
  if (err) return <div className="card p-6 text-red-400">Block “{params.id}” not found: {err}</div>;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Block #{b.block_num}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="card p-4"><div className="text-xs text-white/40">Producer</div><div className="mono">{b.producer}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Time</div><div className="mono text-sm">{b.timestamp}</div></div>
        <div className="card p-4"><div className="text-xs text-white/40">Transactions</div><div>{b.transactions?.length ?? 0}</div></div>
      </div>
      <div className="card p-4">
        <div className="text-xs text-white/40 mb-1">Block ID</div>
        <div className="mono text-xs break-all">{b.id}</div>
      </div>
      {(b.transactions?.length ?? 0) > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-line font-semibold">Transactions</div>
          <div className="divide-y divide-line">
            {b.transactions.map((t: any, i: number) => (
              <div key={i} className="px-4 py-2 mono text-xs break-all">
                {typeof t.trx === "string" ? t.trx : t.trx?.id || JSON.stringify(t.trx).slice(0, 80)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
