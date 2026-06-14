"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Default contracts/accounts surfaced when the box is focused (bloks-style).
const DEFAULTS = [
  { name: "pulse", tag: "system" },
  { name: "pulse.token", tag: "token" },
  { name: "protonnz", tag: "account" },
  { name: "california", tag: "account" },
];

function classify(q: string) {
  const t = q.trim();
  if (!t) return null;
  if (/^\d+$/.test(t)) return { kind: "Block", href: `/block/${t}` };
  if (/^[0-9a-fA-F]{64}$/.test(t)) return { kind: "Tx / Block", href: `/tx/${t}` };
  if (/^(PUB_|EOS)/.test(t)) return { kind: "Key", href: `/search?key=${t}` };
  if (/^[a-z1-5.]{1,13}$/.test(t)) return { kind: "Account", href: `/account/${t}` };
  return { kind: "Search", href: `/account/${t}` };
}

export default function Search() {
  const r = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); (box.current?.querySelector("input") as HTMLInputElement)?.focus(); } };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const cls = classify(q);
  const filtered = q.trim()
    ? DEFAULTS.filter((d) => d.name.includes(q.trim().toLowerCase()))
    : DEFAULTS;

  const go = (href: string) => { setOpen(false); setQ(""); r.push(href); };

  return (
    <div ref={box} className="relative w-full max-w-md">
      <div className="flex items-center gap-2">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && cls) go(cls.href); }}
          placeholder="Search Block # / Account / Public Key / TX ID   ⌘K"
          className="pulse-field w-full px-3 py-2 text-sm text-white/90 placeholder:text-white/35"
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 p-1.5 shadow-2xl"
             style={{ background: "rgb(8 13 34 / 0.99)", backdropFilter: "blur(24px)" }}>
          {cls && q.trim() && (
            <button onClick={() => go(cls.href)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
              <span className="mono">{q.trim()}</span>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">{cls.kind}</span>
            </button>
          )}
          <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wide text-white/35">
            {q.trim() ? "Matching contracts" : "Contracts & accounts"}
          </div>
          {filtered.map((d) => (
            <button key={d.name} onClick={() => go(`/account/${d.name}`)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
              <span className="mono">{d.name}</span>
              <span className="text-xs text-white/35">{d.tag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
