"use client";
import { useState } from "react";
import { SYSTEM } from "@/lib/rpc";
import type { ActionDef } from "@/lib/wallet/types";
import { useAbi } from "./abiCache";
import { useSubmitFlow, SubmitFlowModals, SubmitBar, authFromKey } from "./submitFlow";

const Field = ({ label, hint, ...rest }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-xs text-white/50">
    {label} {hint && <span className="text-white/30">{hint}</span>}
    <input {...rest} className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
  </label>
);

export default function CreateAccountView() {
  const flow = useSubmitFlow();
  const abi = useAbi(SYSTEM);

  const [name, setName] = useState("");
  const [ownerKey, setOwnerKey] = useState("");
  const [activeKey, setActiveKey] = useState("");
  const [sameKey, setSameKey] = useState(true);
  const [ram, setRam] = useState("3000");

  function build(): ActionDef[] {
    const creator = flow.session!.actor;
    const n = name.trim().toLowerCase();
    if (!n) throw new Error("Enter a new account name");
    const oKey = ownerKey.trim();
    const aKey = (sameKey ? ownerKey : activeKey).trim();
    if (!oKey || !aKey) throw new Error("Enter the owner + active public key(s)");
    const bytes = parseInt(ram, 10) || 0;
    return [
      {
        account: SYSTEM,
        name: "newaccount",
        authorization: [],
        data: { creator, name: n, owner: authFromKey(oKey), active: authFromKey(aKey) },
      },
      {
        account: SYSTEM,
        name: "buyrambytes",
        authorization: [],
        data: { payer: creator, receiver: n, bytes },
      },
    ];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Create Account</h1>
        <p className="text-sm text-white/45 mt-1">
          Creates a new account and buys its initial RAM in one transaction via the system contract (
          <span className="mono">{SYSTEM}</span>).
        </p>
      </div>

      <div className="glass-card space-y-3">
        <Field label="New account name" value={name} onChange={(e) => setName(e.target.value.toLowerCase())} placeholder="myaccount111 (a–z, 1–5, max 12)" />
        <Field label="Owner public key" value={ownerKey} onChange={(e) => setOwnerKey(e.target.value)} placeholder="PUB_K1_… / EOS…" />
        <label className="flex items-center gap-2 text-xs text-white/55">
          <input type="checkbox" checked={sameKey} onChange={(e) => setSameKey(e.target.checked)} />
          Use the same key for the active permission
        </label>
        {!sameKey && (
          <Field label="Active public key" value={activeKey} onChange={(e) => setActiveKey(e.target.value)} placeholder="PUB_K1_… / EOS…" />
        )}
        <Field label="RAM bytes" hint="(default 3000)" value={ram} onChange={(e) => setRam(e.target.value)} inputMode="numeric" />

        <SubmitBar
          flow={flow}
          idle="Create & sign →"
          onClick={() => flow.run(build, abi)}
          note={`${SYSTEM}::newaccount + ${SYSTEM}::buyrambytes (one tx) · system contract ABI. If the chain rejects on RAM ordering, the error is surfaced above.`}
        />
      </div>

      <SubmitFlowModals flow={flow} />
    </div>
  );
}
