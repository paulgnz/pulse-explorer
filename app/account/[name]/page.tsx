import { getAccount, getCurrencyBalance, KNOWN_TOKENS, SYSTEM } from "@/lib/rpc";
import ContractBrowser from "@/components/ContractBrowser";
import AccountTabs from "@/components/AccountTabs";
import EmptyState from "@/components/EmptyState";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function Account({ params }: { params: { name: string } }) {
  let acct: any, err = "";
  try {
    acct = await getAccount(params.name);
  } catch (e: any) {
    err = e.message || String(e);
  }

  if (err)
    return (
      <EmptyState icon="🔍" title={`Account ${params.name} not found`} badge="mirror in progress">
        It isn’t on the Pulse Testnet (yet). The 32k+ XPR testnet accounts are being mirrored on-chain — if this is a real
        XPR testnet account, check back shortly.
      </EmptyState>
    );

  // Look up balances for known token contracts; tolerate contracts that aren't deployed.
  const balances = (
    await Promise.all(
      KNOWN_TOKENS.map(async (t) => {
        const r = await getCurrencyBalance(t.contract, params.name, t.sym).catch(() => [] as string[]);
        return (r || []).map((amount) => ({ sym: t.sym, amount, contract: t.contract }));
      })
    )
  ).flat();

  // A WASM contract has a non-epoch last_code_update. The native system contract
  // (`pulse`) and other privileged accounts have native actions (epoch code-update)
  // but still expose an ABI via Hyperion — show the browser for them too.
  const hasCode = acct.last_code_update && acct.last_code_update !== "1970-01-01T00:00:00.000";
  const isSystem = acct.account_name === SYSTEM || acct.privileged;
  // pulse / pulse.* are reserved system names we created, NOT mirrored from XPR.
  const isReserved = acct.account_name === SYSTEM || acct.account_name.startsWith(SYSTEM + ".");
  const isContract = hasCode;
  const showBrowser = hasCode || isSystem;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold mono">{acct.account_name}</h1>
        <CopyButton text={acct.account_name} label="account name" />
        {isContract && <span className="chip bg-accent/20 text-accent">contract</span>}
        {!isContract && isSystem && <span className="chip bg-accent/20 text-accent">system contract</span>}
        {acct.privileged && <span className="chip bg-warn/15 text-warn">privileged</span>}
        {isReserved ? (
          <span className="chip bg-white/10 text-white/60">Reserved system name</span>
        ) : (
          <span className="chip bg-glow/15 text-glow">Reclaimed from XPR testnet</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Core balance (XPR)" value={balances.find((b) => b.sym === "XPR")?.amount || "0.0000 XPR"} />
        <Stat label="Created" value={acct.created} mono />
        <Stat label="RAM used" value={(acct.ram_usage ?? 0).toLocaleString() + " B"} />
        <Stat label="Head block" value={"#" + (acct.head_block_num ?? 0).toLocaleString()} />
      </div>

      <AccountTabs acct={acct} balances={balances} />

      {showBrowser && <ContractBrowser account={acct.account_name} />}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-white/40">{label}</div>
      <div className={`text-base font-semibold break-all ${mono ? "mono text-sm" : ""}`}>{value}</div>
    </div>
  );
}
