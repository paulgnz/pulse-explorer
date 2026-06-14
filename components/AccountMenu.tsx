"use client";
import { useState } from "react";
import { useWallet } from "./WalletProvider";
import ConnectModal from "./ConnectModal";

export default function AccountMenu() {
  const { session, accounts, multisig, setMultisig, disconnect, switchAccount, addAccount } = useWallet();
  const [showConnect, setShowConnect] = useState(false);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState("");

  if (!session) {
    return (
      <>
        <button onClick={() => setShowConnect(true)}
          className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white">Connect Wallet</button>
        {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
      </>
    );
  }

  const methodBadge = session.method === "cli" ? "dev" : session.method === "webauth" ? "webauth" : "wallet";

  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-white/15 px-2.5 py-1.5 text-sm hover:border-white/30">
        <span className="w-5 h-5 rounded-full bg-brand inline-flex items-center justify-center text-[10px] font-bold uppercase">{session.actor.slice(0, 2)}</span>
        <span className="mono">{session.actor}</span>
        <span className="text-white/40">@{session.permission}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/40"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 z-[95] rounded-xl border border-white/10 bg-[rgb(10_16_40)] shadow-2xl p-1.5 text-sm">
            <div className="px-3 py-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-brand inline-flex items-center justify-center text-xs font-bold uppercase">{session.actor.slice(0, 2)}</span>
              <div className="min-w-0">
                <div className="mono font-semibold truncate">{session.actor}<span className="text-white/40">@{session.permission}</span></div>
                <div className="text-[11px] text-white/40 capitalize">{methodBadge} session</div>
              </div>
            </div>

            <a href={`/account/${session.actor}`} className="block rounded-lg px-3 py-2 hover:bg-white/5">View Account</a>

            <label className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer">
              <span>Multisig Mode</span>
              <span onClick={(e) => { e.preventDefault(); setMultisig(!multisig); }}
                className={`relative w-9 h-5 rounded-full transition-colors ${multisig ? "bg-accent" : "bg-white/15"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${multisig ? "left-[18px]" : "left-0.5"}`} />
              </span>
            </label>
            {multisig && <p className="px-3 pb-1 text-[11px] text-glow">Submit builds a pulse.msig propose.</p>}

            {accounts.length > 1 && (
              <div className="border-t border-white/5 mt-1 pt-1">
                <div className="px-3 py-1 text-[11px] text-white/35 uppercase tracking-wide">Switch account</div>
                {accounts.filter((a) => a !== session.actor).map((a) => (
                  <button key={a} onClick={() => { switchAccount(a); setOpen(false); }}
                    className="w-full text-left rounded-lg px-3 py-1.5 hover:bg-white/5 mono">{a}</button>
                ))}
              </div>
            )}

            <div className="border-t border-white/5 mt-1 pt-1 px-2 pb-1">
              <div className="flex gap-1.5">
                <input value={adding} onChange={(e) => setAdding(e.target.value.toLowerCase())} placeholder="add account…"
                  className="pulse-field flex-1 px-2 py-1.5 text-xs mono"
                  onKeyDown={(e) => { if (e.key === "Enter" && adding) { addAccount(adding); switchAccount(adding); setAdding(""); setOpen(false); } }} />
              </div>
            </div>

            <div className="border-t border-white/5 mt-1 pt-1">
              <button onClick={() => { disconnect(); setOpen(false); }}
                className="w-full text-left rounded-lg px-3 py-2 text-danger hover:bg-danger/10">Log Out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
