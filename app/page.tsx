import { getInfo, recentBlocks, CHAIN_NAME } from "@/lib/rpc";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-lg font-semibold mono break-all">{value}</div>
    </div>
  );
}

export default async function Home() {
  let info: any, blocks: any[] = [], err = "";
  try {
    info = await getInfo();
    blocks = await recentBlocks(info.head_block_num, 12);
  } catch (e: any) { err = e.message || String(e); }

  if (err) return <div className="card p-6 text-red-400">Can’t reach the chain RPC: {err}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{CHAIN_NAME}</h1>
        <p className="text-white/40 text-sm">PulseVM · chain {info.chain_id.slice(0, 16)}…</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Head block" value={info.head_block_num} />
        <Stat label="Irreversible" value={info.last_irreversible_block_num} />
        <Stat label="Producer" value={info.head_block_producer} />
        <Stat label="Version" value={info.server_version} />
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-line font-semibold">Recent blocks</div>
        <table className="w-full text-sm">
          <thead className="text-white/40 text-left">
            <tr><th className="px-4 py-2">#</th><th className="px-4 py-2">Producer</th><th className="px-4 py-2">Txns</th><th className="px-4 py-2">Time</th></tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.block_num} className="border-t border-line hover:bg-white/5">
                <td className="px-4 py-2"><a className="text-accent" href={`/block/${b.block_num}`}>{b.block_num}</a></td>
                <td className="px-4 py-2 mono">{b.producer}</td>
                <td className="px-4 py-2">{b.transactions?.length ?? 0}</td>
                <td className="px-4 py-2 text-white/50">{b.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
