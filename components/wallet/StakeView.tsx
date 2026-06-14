"use client";
import { useEffect, useState } from "react";
import { getAccount, getCurrencyBalance, SYSTEM, TOKEN_CONTRACT, CORE_SYMBOL } from "@/lib/rpc";
import type { ActionDef } from "@/lib/wallet/types";
import { useAbi, asset, parseAmount } from "./abiCache";
import { useSubmitFlow, SubmitFlowModals, SubmitBar } from "./submitFlow";

type Tab = "stake" | "unstake" | "refund";

const Field = ({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-xs text-white/50">
    {label}
    <input {...rest} className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
  </label>
);

export default function StakeView() {
  const flow = useSubmitFlow();
  const abi = useAbi(SYSTEM);
  const [tab, setTab] = useState<Tab>("stake");

  const [liquid, setLiquid] = useState(0);
  const [stakedNet, setStakedNet] = useState(0);
  const [stakedCpu, setStakedCpu] = useState(0);

  // stake inputs (two inputs; convenience buttons split the liquid balance)
  const [net, setNet] = useState("");
  const [cpu, setCpu] = useState("");

  const actor = flow.session?.actor;

  useEffect(() => {
    if (!actor) return;
    let live = true;
    (async () => {
      const [bal, acct] = await Promise.all([
        getCurrencyBalance(TOKEN_CONTRACT, actor, CORE_SYMBOL).catch(() => [] as string[]),
        getAccount(actor).catch(() => null),
      ]);
      if (!live) return;
      setLiquid(parseAmount(bal?.[0]));
      const self = acct?.self_delegated_bandwidth;
      const tot = acct?.total_resources;
      setStakedNet(parseAmount(self?.net_weight ?? tot?.net_weight));
      setStakedCpu(parseAmount(self?.cpu_weight ?? tot?.cpu_weight));
    })();
    return () => {
      live = false;
    };
  }, [actor, flow.result]);

  function pct(p: number) {
    const half = ((liquid * p) / 100) / 2;
    setNet(half.toFixed(4));
    setCpu(half.toFixed(4));
  }

  function buildStake(): ActionDef[] {
    const a = actor!;
    const n = parseFloat(net) || 0;
    const c = parseFloat(cpu) || 0;
    if (n + c <= 0) throw new Error("Enter a NET or CPU amount to stake");
    return [
      {
        account: SYSTEM,
        name: "delegatebw",
        authorization: [],
        data: {
          from: a,
          receiver: a,
          stake_net_quantity: asset(n, CORE_SYMBOL),
          stake_cpu_quantity: asset(c, CORE_SYMBOL),
          transfer: false,
        },
      },
    ];
  }

  function buildUnstake(): ActionDef[] {
    const a = actor!;
    const n = parseFloat(net) || 0;
    const c = parseFloat(cpu) || 0;
    if (n + c <= 0) throw new Error("Enter a NET or CPU amount to unstake");
    return [
      {
        account: SYSTEM,
        name: "undelegatebw",
        authorization: [],
        data: {
          from: a,
          receiver: a,
          unstake_net_quantity: asset(n, CORE_SYMBOL),
          unstake_cpu_quantity: asset(c, CORE_SYMBOL),
        },
      },
    ];
  }

  function buildRefund(): ActionDef[] {
    return [{ account: SYSTEM, name: "refund", authorization: [], data: { owner: actor! } }];
  }

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
        <h1 className="text-xl font-bold">Stake {CORE_SYMBOL}</h1>
        <p className="text-sm text-white/45 mt-1">
          Stakes the core token for CPU / NET bandwidth via the system contract (<span className="mono">{SYSTEM}</span>). This
          contract has no claimrewards / voteproducer actions.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label={`Liquid (${CORE_SYMBOL})`} value={liquid.toFixed(4)} />
        <Stat label="Staked NET" value={stakedNet.toFixed(4)} />
        <Stat label="Staked CPU" value={stakedCpu.toFixed(4)} />
      </div>

      <div className="glass-card space-y-4">
        <div className="flex gap-2">
          <TabBtn id="stake" label="Stake" />
          <TabBtn id="unstake" label="Unstake" />
          <TabBtn id="refund" label="Refund" />
        </div>

        {tab !== "refund" && (
          <>
            {tab === "stake" && (
              <div className="flex gap-2">
                {[25, 50, 75, 100].map((p) => (
                  <button key={p} onClick={() => pct(p)} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:border-accent hover:text-accent">
                    {p}%
                  </button>
                ))}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label={`NET ${CORE_SYMBOL}`} value={net} onChange={(e) => setNet(e.target.value)} placeholder="0.0000" inputMode="decimal" />
              <Field label={`CPU ${CORE_SYMBOL}`} value={cpu} onChange={(e) => setCpu(e.target.value)} placeholder="0.0000" inputMode="decimal" />
            </div>
          </>
        )}

        {tab === "refund" && (
          <p className="text-sm text-white/55">
            Claim previously-unstaked {CORE_SYMBOL} back to liquid once the unstaking period has elapsed.
          </p>
        )}

        <SubmitBar
          flow={flow}
          idle={tab === "stake" ? "Stake & sign →" : tab === "unstake" ? "Unstake & sign →" : "Refund & sign →"}
          onClick={() =>
            flow.run(tab === "stake" ? buildStake : tab === "unstake" ? buildUnstake : buildRefund, abi)
          }
          note={`${SYSTEM}::${tab === "stake" ? "delegatebw" : tab === "unstake" ? "undelegatebw" : "refund"} · system contract ABI.`}
        />
      </div>

      <SubmitFlowModals flow={flow} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-base font-semibold mono">{value}</div>
    </div>
  );
}
