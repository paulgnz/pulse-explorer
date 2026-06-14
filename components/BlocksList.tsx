"use client";
import { useEffect, useState } from "react";
import { getInfo, getBlock } from "@/lib/rpc";

function timeAgo(iso: string) {
  if (!iso) return "—";
  const t = new Date(iso + (iso.endsWith("Z") ? "" : "Z")).getTime();
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

interface B { num: number; producer: string; txns: number; time: string; }

export default function BlocksList() {
  const [rows, setRows] = useState<B[]>([]);
  const [head, setHead] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function load(from: number, n = 25) {
    setLoading(true);
    const nums: number[] = [];
    for (let i = from; i > Math.max(0, from - n); i--) nums.push(i);
    const got = await Promise.allSettled(nums.map((x) => getBlock(x)));
    const fresh = got.flatMap((r) =>
      r.status === "fulfilled"
        ? [{ num: r.value.block_num, producer: r.value.producer, txns: r.value.transactions?.length ?? 0, time: r.value.timestamp }]
        : []
    );
    setRows((prev) => (from === head ? fresh : [...prev, ...fresh]));
    setCursor(Math.max(0, from - n));
    setLoading(false);
  }

  useEffect(() => {
    getInfo()
      .then((i) => {
        setHead(i.head_block_num);
        return load(i.head_block_num);
      })
      .catch((e) => setErr(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) return <div className="glass-card text-danger text-sm">Couldn’t load blocks: {err}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Blocks</h1>
        <p className="text-white/45 text-sm">{head ? `Head #${head.toLocaleString()}` : "Loading…"}</p>
      </div>
      <div className="card">
        <table className="w-full text-sm">
          <thead className="text-white/40 text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 font-medium">Block</th>
              <th className="px-4 py-2 font-medium">Producer</th>
              <th className="px-4 py-2 font-medium">Txns</th>
              <th className="px-4 py-2 font-medium">Age</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.num} className="border-t border-line hover:bg-white/5">
                <td className="px-4 py-2"><a className="text-accent" href={`/block/${b.num}`}>#{b.num}</a></td>
                <td className="px-4 py-2 mono">{b.producer}</td>
                <td className="px-4 py-2">
                  <span className={`chip ${b.txns ? "bg-accent/20 text-accent" : "bg-white/5 text-white/40"}`}>{b.txns} tx</span>
                </td>
                <td className="px-4 py-2 text-white/50">{timeAgo(b.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {cursor > 1 && (
        <div className="text-center">
          <button onClick={() => load(cursor)} disabled={loading} className="pill-btn">
            {loading ? "Loading…" : "Load older blocks"}
          </button>
        </div>
      )}
    </div>
  );
}
