"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { WalletSession, LoginMethod, ActionDef } from "@/lib/wallet/types";
import { walletLogin, walletSign } from "@/lib/wallet/transport";
import { buildPackedTrx } from "@/lib/wallet/pack";

const SESSION_KEY = "pulse.wallet.session";
const ACCOUNTS_KEY = "pulse.wallet.accounts";

export interface SubmitOutcome {
  kind: "cli" | "signed" | "error";
  actions?: ActionDef[]; // for cli mode (caller shows the command modal)
  transactionId?: string;
  error?: string;
}

interface WalletCtx {
  session: WalletSession | null;
  accounts: string[];
  multisig: boolean;
  setMultisig: (v: boolean) => void;
  connect: (method: LoginMethod, actor?: string, permission?: string) => Promise<void>;
  disconnect: () => void;
  switchAccount: (actor: string) => void;
  addAccount: (actor: string) => void;
  /** Execute an action with the active session. Returns an outcome the UI renders. */
  submit: (actions: ActionDef[], abiJson: any) => Promise<SubmitOutcome>;
}

const Ctx = createContext<WalletCtx | null>(null);
export const useWallet = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWallet outside WalletProvider");
  return c;
};

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WalletSession | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [multisig, setMultisig] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s));
      const a = localStorage.getItem(ACCOUNTS_KEY);
      if (a) setAccounts(JSON.parse(a));
    } catch {}
  }, []);

  const persist = (s: WalletSession | null) => {
    setSession(s);
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  };
  const persistAccounts = (list: string[]) => {
    setAccounts(list);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  };

  const connect = useCallback(async (method: LoginMethod, actor?: string, permission = "active") => {
    if (method === "cli") {
      if (!actor) throw new Error("Enter an account name to act as");
      const s: WalletSession = { method, actor, permission };
      persist(s);
      persistAccounts(Array.from(new Set([actor, ...accounts])));
      return;
    }
    if (method === "webauth") {
      throw new Error(
        "WebAuth (Pulse Edition) needs the published Pulse ID service. Use the Pulse Wallet or CLI mode for now."
      );
    }
    // pulsevm — desktop deep link
    const r = await walletLogin();
    const s: WalletSession = { method, actor: r.actor, permission: r.permission, publicKey: r.publicKey };
    persist(s);
    persistAccounts(Array.from(new Set([r.actor, ...accounts])));
  }, [accounts]);

  const disconnect = useCallback(() => persist(null), []);
  const switchAccount = useCallback((actor: string) => {
    setSession((s) => {
      if (!s) return s;
      const ns = { ...s, actor };
      localStorage.setItem(SESSION_KEY, JSON.stringify(ns));
      return ns;
    });
  }, []);
  const addAccount = useCallback((actor: string) => {
    persistAccounts(Array.from(new Set([actor, ...accounts])));
  }, [accounts]);

  const submit = useCallback(async (actions: ActionDef[], abiJson: any): Promise<SubmitOutcome> => {
    if (!session) return { kind: "error", error: "Connect a wallet first" };
    // Fill in the authorization with the live session actor/permission.
    const auth = [{ actor: session.actor, permission: session.permission }];
    let acts: ActionDef[] = actions.map((a) => ({ ...a, authorization: auth }));

    // Multisig mode: wrap into a pulse.msig::propose (needs pulse.msig deployed).
    let packAbi = abiJson;
    if (multisig) {
      try {
        const { buildMsigPropose, msigAbi } = await import("@/lib/wallet/pack");
        acts = await buildMsigPropose(acts, session.actor, abiJson);
        packAbi = await msigAbi(); // outer propose serialized with the msig ABI
      } catch (e: any) {
        return { kind: "error", error: `Multisig propose failed: ${e.message}` };
      }
    }

    if (session.method === "cli") {
      return { kind: "cli", actions: acts };
    }
    // pulsevm wallet (and webauth once supported) — pack + sign on device
    try {
      const { packedTrxHex, chainId } = await buildPackedTrx(acts, packAbi);
      const summary = `${acts[0].name} on ${acts[0].account}`;
      const res = await walletSign({ chainId, packedTrx: packedTrxHex, summary });
      return { kind: "signed", transactionId: res.transactionId };
    } catch (e: any) {
      return { kind: "error", error: e.message };
    }
  }, [session, multisig]);

  return (
    <Ctx.Provider value={{ session, accounts, multisig, setMultisig, connect, disconnect, switchAccount, addAccount, submit }}>
      {children}
    </Ctx.Provider>
  );
}
