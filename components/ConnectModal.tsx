"use client";
import { useState } from "react";
import { useWallet } from "./WalletProvider";
import type { LoginMethod } from "@/lib/wallet/types";

export default function ConnectModal({ onClose }: { onClose: () => void }) {
  const { connect } = useWallet();
  const [busy, setBusy] = useState<LoginMethod | null>(null);
  const [err, setErr] = useState("");
  const [cliActor, setCliActor] = useState("");
  const [showCli, setShowCli] = useState(false);

  async function go(method: LoginMethod, actor?: string) {
    setErr("");
    setBusy(method);
    try {
      await connect(method, actor);
      onClose();
    } catch (e: any) {
      setErr(e.message || "Connection failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto" style={{ background: "rgb(4 8 22 / 0.7)" }} onClick={onClose}>
      <div className="w-full max-w-md my-auto rounded-2xl border border-white/10 bg-[rgb(10_16_40)] p-5 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold">Connect Wallet</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        <p className="text-xs text-white/45 mb-4">Sign in to execute contract actions on the Pulse Testnet.</p>

        {err && <div className="mb-3 rounded-lg bg-danger/15 text-danger text-sm px-3 py-2">{err}</div>}

        <div className="space-y-2">
          <Option
            title="Pulse Wallet"
            sub="Native desktop wallet · Touch ID / Secure Enclave"
            icon="🛡️"
            busy={busy === "pulsevm"}
            onClick={() => go("pulsevm")}
          />
          <Option
            title="WebAuth (Pulse Edition)"
            sub="Browser sign-in · requires the Pulse ID service"
            icon="🔐"
            busy={busy === "webauth"}
            onClick={() => go("webauth")}
          />

          {!showCli ? (
            <Option
              title="cleos / pulse-cli (dev mode)"
              sub="Act as an account read-only; emit a CLI command to sign yourself"
              icon="⌨️"
              busy={false}
              onClick={() => setShowCli(true)}
            />
          ) : (
            <div className="rounded-xl border border-white/10 p-3 space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">⌨️ Act as account (dev mode)</div>
              <input
                autoFocus
                value={cliActor}
                onChange={(e) => setCliActor(e.target.value.toLowerCase())}
                placeholder="account name (e.g. protonnz)"
                className="pulse-field w-full px-3 py-2 text-sm mono"
                onKeyDown={(e) => e.key === "Enter" && cliActor && go("cli", cliActor)}
              />
              <div className="flex gap-2">
                <button disabled={!cliActor} onClick={() => go("cli", cliActor)}
                  className="flex-1 rounded-lg bg-brand px-3 py-2 text-sm font-medium disabled:opacity-40">Continue</button>
                <button onClick={() => setShowCli(false)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/60">Back</button>
              </div>
              <p className="text-xs text-white/40">Read-only — no keys are entered. On submit you get a cleos/eosc/pulse command to run.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Option({ title, sub, icon, busy, onClick }: { title: string; sub: string; icon: string; busy: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={busy}
      className="w-full flex items-center gap-3 rounded-xl border border-white/10 hover:border-accent/50 hover:bg-white/[0.03] px-3 py-3 text-left transition-colors disabled:opacity-50">
      <span className="text-2xl">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-white/45">{sub}</span>
      </span>
      {busy && <span className="text-xs text-accent">opening…</span>}
    </button>
  );
}
