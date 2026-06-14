"use client";
import { useEffect, useRef, useState } from "react";
import { getInfo, getBlock, type ChainInfo } from "@/lib/rpc";

function timeAgo(iso: string) {
  if (!iso) return "—";
  const t = new Date(iso + (iso.endsWith("Z") ? "" : "Z")).getTime();
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

interface LaneBlock { num: number; producer: string; txns: number; time: string; }

export default function LiveHome({ initial }: { initial: ChainInfo }) {
  const [info, setInfo] = useState<ChainInfo>(initial);
  const [lane, setLane] = useState<LaneBlock[]>([]);
  const [beat, setBeat] = useState(false);
  const [online, setOnline] = useState(true);
  const lastHead = useRef(0);

  // Seed the lane with recent blocks once.
  useEffect(() => {
    let alive = true;
    (async () => {
      const head = initial.head_block_num;
      const nums: number[] = [];
      for (let i = head; i > Math.max(0, head - 12); i--) nums.push(i);
      const got = await Promise.allSettled(nums.map((n) => getBlock(n)));
      if (!alive) return;
      setLane(
        got.flatMap((r) =>
          r.status === "fulfilled"
            ? [{ num: r.value.block_num ?? r.value.timestamp, producer: r.value.producer, txns: r.value.transactions?.length ?? 0, time: r.value.timestamp }]
            : []
        )
      );
      lastHead.current = head;
    })();
    return () => { alive = false; };
  }, [initial.head_block_num]);

  // Poll getInfo for new heads.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const i = await getInfo();
        if (!alive) return;
        setOnline(true);
        if (i.head_block_num !== info.head_block_num) {
          setBeat(true);
          setTimeout(() => alive && setBeat(false), 900);
        }
        setInfo(i);
        // Fetch any new blocks between lastHead and the new head.
        if (i.head_block_num > lastHead.current && lastHead.current) {
          const from = lastHead.current + 1;
          const nums: number[] = [];
          for (let n = from; n <= i.head_block_num && n - from < 8; n++) nums.push(n);
          const got = await Promise.allSettled(nums.map((n) => getBlock(n)));
          if (!alive) return;
          const fresh = got.flatMap((r) =>
            r.status === "fulfilled"
              ? [{ num: r.value.block_num, producer: r.value.producer, txns: r.value.transactions?.length ?? 0, time: r.value.timestamp }]
              : []
          );
          if (fresh.length) setLane((prev) => [...fresh.reverse(), ...prev].slice(0, 12));
          lastHead.current = i.head_block_num;
        }
      } catch {
        if (alive) setOnline(false);
      }
    };
    const id = setInterval(tick, 2500);
    return () => { alive = false; clearInterval(id); };
  }, [info.head_block_num]);

  const lib = info.last_irreversible_block_num;
  const head = info.head_block_num;
  const gap = head - lib;
  const halted = gap > 20; // LIB chase: large gap => possible halt

  return (
    <div className="space-y-6">
      {/* Aurora hero */}
      <div className="aurora glass-card !p-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5 text-sm text-white/55">
              <span className="relative inline-flex">
                <span className={`w-2.5 h-2.5 rounded-full ${online ? "bg-success" : "bg-danger"}`} />
                {beat && <span className="absolute inset-0 rounded-full bg-success animate-ping-once" />}
              </span>
              {online ? (halted ? "Liveness warning" : "Live") : "RPC unreachable"} · {CHAIN_NAME_SHORT}
            </div>
            <div className="mt-2 text-5xl font-bold tracking-tight text-brand tabular-nums">
              #{head.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-white/40">
              head block · produced {timeAgo(info.head_block_time)} by{" "}
              <span className="mono text-white/60">{info.head_block_producer}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 min-w-[260px]">
            <Mini label="Irreversible" value={`#${lib.toLocaleString()}`} />
            <Mini label="Head − LIB" value={`${gap}`} tone={halted ? "danger" : gap <= 4 ? "success" : "warn"} />
            <Mini label="Version" value={info.server_version_string || info.server_version} />
            <Mini label="Chain" value={`${info.chain_id.slice(0, 8)}…`} mono />
          </div>
        </div>
        {/* LIB-chase bar / halt detector */}
        <div className="mt-5">
          <div className="flex justify-between text-[11px] text-white/40 mb-1">
            <span>LIB chasing head</span>
            <span>{halted ? "gap unusually large — watch for halt" : "healthy"}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${halted ? "bg-danger" : "bg-gradient-to-r from-accent to-glow"}`}
              style={{ width: `${Math.max(4, 100 - Math.min(100, gap * 4))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Live block lane */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-semibold">Live blocks</h2>
          <span className="text-xs text-white/35">updates every 2.5s</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2">
          {lane.map((b) => (
            <a
              key={b.num}
              href={`/block/${b.num}`}
              className="block-enter shrink-0 w-28 glass-card !p-3 hover:border-accent/40 transition"
            >
              <div className="text-[11px] text-white/40">#{Number(b.num).toLocaleString?.() ?? b.num}</div>
              <div className="mt-1 mono text-xs text-white/75 truncate">{b.producer}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`chip ${b.txns ? "bg-accent/20 text-accent" : "bg-white/5 text-white/40"}`}>
                  {b.txns} tx
                </span>
              </div>
            </a>
          ))}
          {lane.length === 0 && <div className="text-sm text-white/40 py-6">Loading blocks…</div>}
        </div>
      </div>

      {/* Recent blocks table */}
      <div className="card">
        <div className="px-4 py-3 border-b border-line font-semibold">Recent blocks</div>
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
            {lane.map((b) => (
              <tr key={b.num} className="border-t border-line hover:bg-white/5">
                <td className="px-4 py-2"><a className="text-accent" href={`/block/${b.num}`}>#{b.num}</a></td>
                <td className="px-4 py-2 mono">{b.producer}</td>
                <td className="px-4 py-2">{b.txns}</td>
                <td className="px-4 py-2 text-white/50">{timeAgo(b.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CHAIN_NAME_SHORT = "XPR Network Pulse Testnet";

function Mini({ label, value, tone, mono }: { label: string; value: any; tone?: "success" | "warn" | "danger"; mono?: boolean }) {
  const toneCls = tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : tone === "success" ? "text-success" : "text-white/85";
  return (
    <div className="rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-white/35">{label}</div>
      <div className={`text-sm font-semibold ${toneCls} ${mono ? "mono" : ""} truncate`}>{value}</div>
    </div>
  );
}
