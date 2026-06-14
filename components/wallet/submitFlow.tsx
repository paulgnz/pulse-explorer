"use client";
import { useState, useCallback } from "react";
import { useWallet } from "../WalletProvider";
import ConnectModal from "../ConnectModal";
import CliCommandModal from "../CliCommandModal";
import type { ActionDef } from "@/lib/wallet/types";

/**
 * Shared action-submission flow used by every Wallet sub-view.
 * Mirrors ContractBrowser.doSubmit(): builds ActionDef[] (authorization is filled
 * by WalletProvider.submit), routes the outcome to a CLI modal / success / error,
 * and surfaces a ConnectModal when there's no session.
 */
export function useSubmitFlow() {
  const { session, submit } = useWallet();
  const [showConnect, setShowConnect] = useState(false);
  const [cliActions, setCliActions] = useState<ActionDef[] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  /**
   * @param build  returns the ActionDef[] for the transaction (throw to abort with an error)
   * @param abi    the ABI used to serialize the actions (e.g. getAbiSnapshot("pulse.token"))
   */
  const run = useCallback(
    async (build: () => ActionDef[] | Promise<ActionDef[]>, abi: any) => {
      setResult(null);
      if (!session) {
        setShowConnect(true);
        return;
      }
      setSubmitting(true);
      try {
        const actions = await build();
        if (!actions.length) throw new Error("Nothing to submit");
        if (!abi) throw new Error("ABI unavailable — Hyperion hasn't indexed this contract's ABI yet.");
        const out = await submit(actions, abi);
        if (out.kind === "cli") setCliActions(out.actions!);
        else if (out.kind === "signed")
          setResult({
            ok: true,
            msg: out.transactionId ? `Broadcast ✓ ${out.transactionId.slice(0, 16)}…` : "Signed & broadcast ✓",
          });
        else setResult({ ok: false, msg: out.error || "Failed" });
      } catch (e: any) {
        setResult({ ok: false, msg: e?.message || "Failed" });
      } finally {
        setSubmitting(false);
      }
    },
    [session, submit]
  );

  const reset = useCallback(() => setResult(null), []);

  return { session, submitting, result, run, reset, showConnect, setShowConnect, cliActions, setCliActions };
}

/** Renders the connect / CLI modals + the success/error line. Drop at the end of a sub-view. */
export function SubmitFlowModals({
  flow,
}: {
  flow: ReturnType<typeof useSubmitFlow>;
}) {
  return (
    <>
      {flow.showConnect && <ConnectModal onClose={() => flow.setShowConnect(false)} />}
      {flow.cliActions && <CliCommandModal actions={flow.cliActions} onClose={() => flow.setCliActions(null)} />}
    </>
  );
}

/** The shared submit button label, matching ContractBrowser semantics. */
export function submitLabel(flow: ReturnType<typeof useSubmitFlow>, idle: string) {
  if (flow.submitting) return "Submitting…";
  if (!flow.session) return "Connect wallet →";
  return flow.session.method === "cli" ? "Get CLI command →" : idle;
}

/** AUTH(key) helper used by Create Account + Keys & Permissions. */
export function authFromKey(key: string) {
  return { threshold: 1, keys: [{ key: key.trim(), weight: 1 }], accounts: [] as any[], waits: [] as any[] };
}

/** A consistent submit button + result line for sub-views. */
export function SubmitBar({
  flow,
  idle,
  onClick,
  note,
}: {
  flow: ReturnType<typeof useSubmitFlow>;
  idle: string;
  onClick: () => void;
  note?: string;
}) {
  return (
    <div className="pt-1">
      <button
        onClick={onClick}
        disabled={flow.submitting}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {submitLabel(flow, idle)}
      </button>
      {flow.result && (
        <p className={`text-xs mt-2 ${flow.result.ok ? "text-success" : "text-danger"} break-all`}>{flow.result.msg}</p>
      )}
      {note && <p className="text-xs text-white/40 mt-2">{note}</p>}
    </div>
  );
}
