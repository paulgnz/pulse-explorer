"use client";
import { useState } from "react";
import { SYSTEM } from "@/lib/rpc";
import type { ActionDef } from "@/lib/wallet/types";
import { useAbi } from "./abiCache";
import { useSubmitFlow, SubmitFlowModals, SubmitBar } from "./submitFlow";

const Field = ({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-xs text-white/50">
    {label}
    <input {...rest} className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
  </label>
);

export default function UtilitiesView() {
  const flow = useSubmitFlow();
  const abi = useAbi(SYSTEM);

  const [buyReceiver, setBuyReceiver] = useState("");
  const [buyBytes, setBuyBytes] = useState("3000");
  const [sellBytes, setSellBytes] = useState("");

  const actor = flow.session?.actor;

  function buildBuy(): ActionDef[] {
    const bytes = parseInt(buyBytes, 10) || 0;
    if (bytes <= 0) throw new Error("Enter a positive byte count");
    return [
      {
        account: SYSTEM,
        name: "buyrambytes",
        authorization: [],
        data: { payer: actor!, receiver: (buyReceiver.trim() || actor!).toLowerCase(), bytes },
      },
    ];
  }
  function buildSell(): ActionDef[] {
    const bytes = parseInt(sellBytes, 10) || 0;
    if (bytes <= 0) throw new Error("Enter a positive byte count");
    return [{ account: SYSTEM, name: "sellram", authorization: [], data: { account: actor!, bytes } }];
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Utilities</h1>
        <p className="text-sm text-white/45 mt-1">Buy / sell RAM and jump to your account page.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card space-y-3">
          <h2 className="font-semibold text-sm">Buy RAM</h2>
          <Field label="Receiver" value={buyReceiver} onChange={(e) => setBuyReceiver(e.target.value.toLowerCase())} placeholder={actor || "your account"} />
          <Field label="Bytes" value={buyBytes} onChange={(e) => setBuyBytes(e.target.value)} inputMode="numeric" />
          <SubmitBar flow={flow} idle="Buy RAM & sign →" onClick={() => flow.run(buildBuy, abi)} note={`${SYSTEM}::buyrambytes`} />
        </div>

        <div className="glass-card space-y-3">
          <h2 className="font-semibold text-sm">Sell RAM</h2>
          <Field label="Bytes" value={sellBytes} onChange={(e) => setSellBytes(e.target.value)} placeholder="bytes to sell" inputMode="numeric" />
          <SubmitBar flow={flow} idle="Sell RAM & sign →" onClick={() => flow.run(buildSell, abi)} note={`${SYSTEM}::sellram`} />
        </div>
      </div>

      {actor && (
        <a href={`/account/${actor}`} className="inline-block rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-accent hover:text-accent">
          View my account page → {actor}
        </a>
      )}

      <SubmitFlowModals flow={flow} />
    </div>
  );
}
