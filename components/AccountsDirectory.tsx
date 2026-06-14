"use client";
import { useEffect, useMemo, useState } from "react";

const PAGE = 60;

export default function AccountsDirectory() {
  const [all, setAll] = useState<string[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch("/accounts.json")
      .then((r) => r.json())
      .then((d: string[]) => setAll(d))
      .catch((e) => setErr(String(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!all) return [];
    const t = q.trim().toLowerCase();
    if (!t) return all;
    // prefix matches first, then substring
    const pre: string[] = [];
    const sub: string[] = [];
    for (const n of all) {
      if (n.startsWith(t)) pre.push(n);
      else if (n.includes(t)) sub.push(n);
      if (pre.length > 2000) break;
    }
    return pre.concat(sub);
  }, [all, q]);

  useEffect(() => setPage(0), [q]);

  const shown = filtered.slice(0, (page + 1) * PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Accounts</h1>
          <p className="text-white/45 text-sm">
            {all ? `${all.length.toLocaleString()} accounts mirrored from the XPR Network testnet` : "Loading directory…"}
          </p>
        </div>
        <span className="chip bg-glow/15 text-glow">Reclaimed from XPR testnet</span>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter accounts by name…"
        className="pulse-field w-full px-4 py-2.5 text-sm mono text-white/90 placeholder:text-white/35"
      />

      {err && <div className="glass-card text-danger text-sm">Couldn’t load accounts.json: {err}</div>}

      {all && (
        <>
          <div className="text-xs text-white/40">
            {filtered.length.toLocaleString()} match{filtered.length === 1 ? "" : "es"}
            {q && filtered.length === 0 && " — try a shorter prefix"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {shown.map((n) => (
              <a
                key={n}
                href={`/account/${n}`}
                className="glass-card !p-3 hover:border-accent/40 transition group"
              >
                <div className="mono text-sm truncate group-hover:text-accent">{n}</div>
              </a>
            ))}
          </div>
          {shown.length < filtered.length && (
            <div className="text-center pt-2">
              <button onClick={() => setPage((p) => p + 1)} className="pill-btn">
                Load more ({(filtered.length - shown.length).toLocaleString()} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
