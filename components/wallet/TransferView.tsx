"use client";
import { useState } from "react";
import { getCurrencyBalance, TOKEN_CONTRACT, CORE_SYMBOL } from "@/lib/rpc";
import type { ActionDef } from "@/lib/wallet/types";
import { useAbi, asset } from "./abiCache";
import { useSubmitFlow, SubmitFlowModals, SubmitBar } from "./submitFlow";

type Tab = "transfer" | "multi" | "batch";

const Field = ({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-xs text-white/50">
    {label}
    <input {...rest} className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
  </label>
);

export default function TransferView() {
  const flow = useSubmitFlow();
  const abi = useAbi(TOKEN_CONTRACT);
  const [tab, setTab] = useState<Tab>("transfer");

  // token selection (XPR default, allow custom contract/symbol)
  const [contract, setContract] = useState(TOKEN_CONTRACT);
  const [symbol, setSymbol] = useState(CORE_SYMBOL);

  // single
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  // multi / batch rows
  const [rows, setRows] = useState<{ to: string; amount: string; memo: string }[]>([
    { to: "", amount: "", memo: "" },
    { to: "", amount: "", memo: "" },
  ]);

  // The active contract's ABI (defaults to pulse.token; refetch if user changes it).
  const tokenAbi = useAbi(contract);

  async function fillEntire() {
    if (!flow.session) {
      flow.setShowConnect(true);
      return;
    }
    const bal = await getCurrencyBalance(contract, flow.session.actor, symbol).catch(() => [] as string[]);
    if (bal?.[0]) setAmount(bal[0].split(" ")[0]);
  }

  function buildSingle(): ActionDef[] {
    const from = flow.session!.actor;
    if (!to.trim()) throw new Error("Enter a recipient");
    if (!parseFloat(amount)) throw new Error("Enter an amount");
    return [
      {
        account: contract,
        name: "transfer",
        authorization: [],
        data: { from, to: to.trim(), quantity: asset(amount, symbol), memo },
      },
    ];
  }

  function buildRows(sharedMemo?: string): ActionDef[] {
    const from = flow.session!.actor;
    const acts = rows
      .filter((r) => r.to.trim() && parseFloat(r.amount))
      .map((r) => ({
        account: contract,
        name: "transfer",
        authorization: [] as any[],
        data: { from, to: r.to.trim(), quantity: asset(r.amount, symbol), memo: sharedMemo ?? r.memo },
      }));
    if (!acts.length) throw new Error("Add at least one recipient + amount");
    return acts;
  }

  const setRow = (i: number, patch: Partial<{ to: string; amount: string; memo: string }>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-1.5 text-sm rounded-lg ${tab === id ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Transfer Tokens</h1>
        <p className="text-sm text-white/45 mt-1">Send {symbol} (or any token) on the Pulse Testnet.</p>
      </div>

      <div className="glass-card space-y-4">
        <div className="flex gap-2">
          <TabBtn id="transfer" label="Transfer" />
          <TabBtn id="multi" label="Multi Transfer" />
          <TabBtn id="batch" label="Batch Transfer" />
        </div>

        {/* token selector */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Token contract" value={contract} onChange={(e) => setContract(e.target.value.toLowerCase())} placeholder="pulse.token" />
          <Field label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="XPR" />
        </div>

        {tab === "transfer" && (
          <div className="space-y-3">
            <Field label="To" value={to} onChange={(e) => setTo(e.target.value.toLowerCase())} placeholder="recipient account" />
            <div>
              <Field label={`Amount (${symbol})`} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0000" inputMode="decimal" />
              <button onClick={fillEntire} className="text-xs text-accent hover:underline mt-1">send entire balance</button>
            </div>
            <Field label="Memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="(optional)" />
            <SubmitBar
              flow={flow}
              idle="Send & sign →"
              onClick={() => flow.run(buildSingle, tokenAbi)}
              note={`${contract}::transfer · serialized with the ${contract} ABI.`}
            />
          </div>
        )}

        {(tab === "multi" || tab === "batch") && (
          <div className="space-y-3">
            <p className="text-xs text-white/45">
              {tab === "multi"
                ? "Several recipients with individual amounts/memos — sent as one transaction with multiple transfer actions."
                : "Pay many recipients in one transaction. Use the shared memo below."}
            </p>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_140px_1fr_auto] gap-2 items-end">
                <Field label={i === 0 ? "To" : ""} value={r.to} onChange={(e) => setRow(i, { to: e.target.value.toLowerCase() })} placeholder="account" />
                <Field label={i === 0 ? `Amount (${symbol})` : ""} value={r.amount} onChange={(e) => setRow(i, { amount: e.target.value })} placeholder="0.0000" inputMode="decimal" />
                {tab === "multi" ? (
                  <Field label={i === 0 ? "Memo" : ""} value={r.memo} onChange={(e) => setRow(i, { memo: e.target.value })} placeholder="(optional)" />
                ) : (
                  <div />
                )}
                <button
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                  className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/50 hover:text-danger hover:border-danger/40"
                  title="Remove row"
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={() => setRows((rs) => [...rs, { to: "", amount: "", memo: "" }])} className="text-xs text-accent hover:underline">
              + add recipient
            </button>
            {tab === "batch" && (
              <Field label="Shared memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="(optional)" />
            )}
            <SubmitBar
              flow={flow}
              idle="Send all & sign →"
              onClick={() => flow.run(() => buildRows(tab === "batch" ? memo : undefined), tokenAbi)}
              note={`${rows.filter((r) => r.to && r.amount).length} transfer action(s) · ${contract} ABI.`}
            />
          </div>
        )}
      </div>

      <SubmitFlowModals flow={flow} />
    </div>
  );
}
