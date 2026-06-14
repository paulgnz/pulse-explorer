"use client";
import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import ConnectModal from "@/components/ConnectModal";
import TransferView from "@/components/wallet/TransferView";
import StakeView from "@/components/wallet/StakeView";
import CreateAccountView from "@/components/wallet/CreateAccountView";
import KeysView from "@/components/wallet/KeysView";
import UtilitiesView from "@/components/wallet/UtilitiesView";

type View = "transfer" | "stake" | "create" | "keys" | "utils";

const NAV: { id: View; label: string; icon: string }[] = [
  { id: "transfer", label: "Transfer Tokens", icon: "↗" },
  { id: "stake", label: "Stake XPR", icon: "◈" },
  { id: "create", label: "Create Account", icon: "＋" },
  { id: "keys", label: "Keys & Permissions", icon: "🔑" },
  { id: "utils", label: "Utilities", icon: "⚙" },
];

export default function WalletPage() {
  const { session } = useWallet();
  const [view, setView] = useState<View>("transfer");
  const [showConnect, setShowConnect] = useState(false);

  if (!session) {
    return (
      <div className="glass-card text-center py-12 max-w-lg mx-auto">
        <div className="text-4xl mb-3">🛡️</div>
        <h1 className="text-xl font-bold">Connect wallet to use the Wallet</h1>
        <p className="text-sm text-white/50 mt-2 mb-5">
          Transfer tokens, stake {`XPR`}, create accounts and manage permissions — all signed by your wallet (or emitted as a
          CLI command in dev mode).
        </p>
        <button onClick={() => setShowConnect(true)} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-medium">
          Connect Wallet
        </button>
        {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-[220px_1fr] gap-5 items-start">
      <nav className="glass-card md:sticky md:top-24 p-2 space-y-1">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-colors ${
              view === n.id ? "bg-accent text-white font-medium" : "text-white/65 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="w-5 text-center opacity-80">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <section className="min-w-0">
        {view === "transfer" && <TransferView />}
        {view === "stake" && <StakeView />}
        {view === "create" && <CreateAccountView />}
        {view === "keys" && <KeysView />}
        {view === "utils" && <UtilitiesView />}
      </section>
    </div>
  );
}
