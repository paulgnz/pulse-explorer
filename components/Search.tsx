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
  if (/^(PUB_|EOS)/.test(t)) return { kind: "Key", href: `/key/${encodeURIComponent(t)}` };
  if (/^[a-z1-5.]{1,13}$/.test(t)) return { kind: "Account", href: `/account/${t}` };
  return { kind: "Search", href: `/account/${t}` };
}

export default function Search() {
  const r = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  // Mobile: search starts collapsed to an icon and expands to a full-width overlay.
  const [expanded, setExpanded] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) { setOpen(false); setExpanded(false); }
    };
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setExpanded(true);
        setOpen(true);
        requestAnimationFrame(() => (box.current?.querySelector("input") as HTMLInputElement)?.focus());
      }
      if (e.key === "Escape") { setOpen(false); setExpanded(false); }
    };
    document.addEventListener("mousedown", h);
    document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, []);

  const cls = classify(q);
  const filtered = q.trim()
    ? DEFAULTS.filter((d) => d.name.includes(q.trim().toLowerCase()))
    : DEFAULTS;

  const go = (href: string) => { setOpen(false); setExpanded(false); setQ(""); r.push(href); };

  const Dropdown = (
    <div className="absolute z-50 mt-2 left-0 right-0 max-w-[calc(100vw-2rem)] mx-auto overflow-hidden rounded-2xl border border-white/10 p-1.5 shadow-2xl"
         style={{ background: "rgb(8 13 34 / 0.99)", backdropFilter: "blur(24px)" }}>
      {cls && q.trim() && (
        <button onClick={() => go(cls.href)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
          <span className="mono truncate">{q.trim()}</span>
          <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">{cls.kind}</span>
        </button>
      )}
      <div className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wide text-white/35">
        {q.trim() ? "Matching contracts" : "Contracts & accounts"}
      </div>
      {filtered.map((d) => (
        <button key={d.name} onClick={() => go(`/account/${d.name}`)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5">
          <span className="mono truncate">{d.name}</span>
          <span className="shrink-0 text-xs text-white/35">{d.tag}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile: collapsed search icon. Hidden on md+. */}
      <button
        aria-label="Search"
        onClick={() => { setExpanded(true); setOpen(true); requestAnimationFrame(() => (box.current?.querySelector("input") as HTMLInputElement)?.focus()); }}
        className="md:hidden inline-flex items-center justify-center rounded-lg border border-white/15 p-2 text-white/80 hover:border-white/30"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      </button>

      {/* Mobile full-width overlay input row. */}
      {expanded && (
        <div ref={box} className="md:hidden fixed inset-x-0 top-0 z-[100] p-3 border-b border-white/10"
             style={{ background: "rgb(8 13 34 / 0.99)", backdropFilter: "blur(24px)" }}>
          <div className="relative max-w-6xl mx-auto flex items-center gap-2">
            <input
              autoFocus value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)}
              onKeyDown={(e) => { if (e.key === "Enter" && cls) go(cls.href); }}
              placeholder="Block # / Account / Key / TX ID"
              className="pulse-field w-full px-3 py-2.5 text-sm text-white/90 placeholder:text-white/35"
            />
            <button aria-label="Close search" onClick={() => { setExpanded(false); setOpen(false); }}
              className="shrink-0 rounded-lg border border-white/15 p-2 text-white/70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            {open && Dropdown}
          </div>
        </div>
      )}

      {/* Desktop inline search. Hidden below md. */}
      <div ref={expanded ? undefined : box} className="relative w-full max-w-md hidden md:block">
        <input
          value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && cls) go(cls.href); }}
          placeholder="Search Block # / Account / Public Key / TX ID   ⌘K"
          className="pulse-field w-full px-3 py-2 text-sm text-white/90 placeholder:text-white/35"
        />
        {open && !expanded && Dropdown}
      </div>
    </>
  );
}
