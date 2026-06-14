"use client";
import { useState } from "react";
import { useWallet } from "./WalletProvider";
import ConnectModal from "./ConnectModal";
import type { LoginMethod } from "@/lib/wallet/types";

/** Small glyph indicating how an account is connected. */
function MethodIcon({ method, className = "" }: { method: LoginMethod; className?: string }) {
  if (method === "cli")
    return (
      <span className={`inline-flex items-center justify-center rounded bg-white/10 text-white/70 ${className}`} style={{ width: 22, height: 22 }} title="CLI / terminal">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m4 17 6-6-6-6" /><path d="M12 19h8" /></svg>
      </span>
    );
  // pulsevm / webauth — show the pulse mark
  return (
    <span className={`inline-flex items-center justify-center rounded-full ${className}`} title={method === "webauth" ? "WebAuth" : "Pulse Wallet"} style={{ width: 22, height: 22, background: "linear-gradient(135deg,#4F7CFF,#8B95FF)" }}>
      <svg width="13" height="13" viewBox="0 0 32 32" fill="none"><path d="M5 16.5H11L13.5 9.5L18 23L20.5 16.5H27" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

export default function AccountMenu() {
  const { session, accounts, multisig, setMultisig, disconnect, switchAccount, removeAccount } = useWallet();
  const [showConnect, setShowConnect] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [searching, setSearching] = useState(false);

  if (!session) {
    return (
      <>
        <button onClick={() => setShowConnect(true)}
          className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Connect Wallet</button>
        {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
      </>
    );
  }

  const filtered = accounts.filter((a) => a.actor.includes(filter.toLowerCase()));

  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-white/15 px-2.5 py-1.5 text-sm hover:border-white/30">
        <span className="mono">{session.actor}</span>
        <span className="text-white/40">({session.permission})</span>
        <MethodIcon method={session.method} className="!w-5 !h-5" />
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/40"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 z-[95] rounded-2xl border border-white/10 bg-[rgb(10_16_40)] shadow-2xl p-4 text-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="w-14 h-14 rounded-full bg-white inline-flex items-center justify-center shrink-0">
                <svg width="34" height="34" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#amg)" /><path d="M5 16.5H11L13.5 9.5L18 23L20.5 16.5H27" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><defs><linearGradient id="amg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse"><stop stopColor="#4F7CFF" /><stop offset="1" stopColor="#8B95FF" /></linearGradient></defs></svg>
              </span>
              <div className="min-w-0">
                <div className="mono font-bold text-base truncate">{session.actor}</div>
                <div className="flex items-center gap-1.5 text-white/50">{session.permission} <MethodIcon method={session.method} className="!w-[18px] !h-[18px]" /></div>
              </div>
            </div>

            <a href={`/account/${session.actor}`}
              className="block text-center rounded-xl border border-accent/60 text-accent py-2 mb-3 hover:bg-accent/10">View Account</a>

            <label className="flex items-center gap-3 mb-3 cursor-pointer">
              <span onClick={(e) => { e.preventDefault(); setMultisig(!multisig); }}
                className={`relative w-10 h-5 rounded-full transition-colors ${multisig ? "bg-accent" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${multisig ? "left-[22px]" : "left-0.5"}`} />
              </span>
              <span className="font-medium">Multisig Mode</span>
            </label>

            {/* Accounts list */}
            <div className="flex items-center justify-between border-t border-white/10 pt-2 mb-1">
              <span className="text-[11px] tracking-wide text-white/40 uppercase">Accounts ({accounts.length})</span>
              <button onClick={() => setSearching((s) => !s)} className="text-white/40 hover:text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              </button>
            </div>
            {searching && (
              <input autoFocus value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="filter…"
                className="pulse-field w-full px-2 py-1.5 text-xs mono mb-2" />
            )}

            <div className="max-h-56 overflow-y-auto -mx-1 px-1 mb-3">
              {filtered.map((a) => {
                const active = a.actor === session.actor && a.permission === session.permission;
                return (
                  <div key={`${a.actor}@${a.permission}`}
                    className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${active ? "bg-accent/10" : "hover:bg-white/5"}`}>
                    <MethodIcon method={a.method} />
                    <span className="flex-1 min-w-0 mono truncate">{a.actor} <span className="text-white/40">({a.permission})</span></span>
                    {!active && (
                      <button onClick={() => { switchAccount(a.actor); setOpen(false); }} title="Switch to this account" className="text-white/40 hover:text-accent">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="m10 8 4 4-4 4" /></svg>
                      </button>
                    )}
                    {accounts.length > 1 && (
                      <button onClick={() => removeAccount(a.actor, a.permission)} title="Remove account" className="text-white/40 hover:text-danger">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowConnect(true); setOpen(false); }}
                className="flex-1 rounded-xl border border-accent/60 text-accent py-2 hover:bg-accent/10">Add Account</button>
              <button onClick={() => { disconnect(); setOpen(false); }}
                className="flex-1 rounded-xl border border-white/20 text-white/80 py-2 hover:bg-white/5">Log Out</button>
            </div>
          </div>
        </>
      )}

      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
    </div>
  );
}
