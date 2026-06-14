"use client";
import { useState } from "react";
import { RPC, SYSTEM } from "@/lib/rpc";

type Kind = "cpu" | "net" | "ram";

export default function ResourcesForm() {
  const [kind, setKind] = useState<Kind>("cpu");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");

  function submit() {
    // Scaffold: hand off to the Pulse Wallet via the pulsevm:// scheme.
    const action =
      kind === "ram"
        ? { account: SYSTEM, name: "buyrambytes", data: { payer: account, receiver: account, bytes: Number(amount) || 0 } }
        : {
            account: SYSTEM,
            name: "delegatebw",
            data: {
              from: account,
              receiver: account,
              stake_net_quantity: kind === "net" ? `${amount} XPR` : "0.0000 XPR",
              stake_cpu_quantity: kind === "cpu" ? `${amount} XPR` : "0.0000 XPR",
              transfer: false,
            },
          };
    const payload = btoa(JSON.stringify({ actions: [{ ...action, authorization: [{ actor: account || "<you>", permission: "active" }] }], rpc: RPC }));
    window.location.href = `pulsevm://sign?tx=${payload}`;
  }

  const Tab = ({ id, label }: { id: Kind; label: string }) => (
    <button onClick={() => setKind(id)} className={kind === id ? "pill-btn-on" : "pill-btn"}>
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-white/45 text-sm">Stake for CPU / NET or buy RAM</p>
      </div>

      <div className="glass-card max-w-lg space-y-4">
        <div className="flex gap-2">
          <Tab id="cpu" label="CPU" />
          <Tab id="net" label="NET" />
          <Tab id="ram" label="RAM" />
        </div>

        <label className="block text-xs text-white/50">
          Account
          <input value={account} onChange={(e) => setAccount(e.target.value)} placeholder="youraccount"
                 className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
        </label>

        <label className="block text-xs text-white/50">
          {kind === "ram" ? "Bytes" : "Amount (XPR to stake)"}
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={kind === "ram" ? "8192" : "10.0000"}
                 className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
        </label>

        <button onClick={submit} className="rounded-lg bg-brand px-4 py-2.5 text-sm font-medium w-full">
          {kind === "ram" ? "Buy RAM" : `Stake ${kind.toUpperCase()}`} via Pulse Wallet →
        </button>
        <p className="text-xs text-white/40">
          Scaffold UI. Opens the Pulse Wallet (<span className="mono">pulsevm://</span>) to review &amp; sign. Resource
          pricing and live balances wire up once the system contract is deployed.
        </p>
      </div>
    </div>
  );
}
