import { getKeyAccounts } from "@/lib/hyperion";
import { hyperionConfigured } from "@/lib/hyperion";
import EmptyState from "@/components/EmptyState";
import CopyButton from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export default async function KeyPage({ params }: { params: { key: string } }) {
  const key = decodeURIComponent(params.key);
  let accounts: string[] = [];
  let err = "";
  if (!hyperionConfigured()) {
    err = "Key → accounts lookup needs Hyperion (get_key_accounts), which isn't configured for this network.";
  } else {
    try {
      const r: any = await getKeyAccounts(key);
      accounts = r?.account_names || [];
    } catch (e: any) {
      err = "Hyperion is unavailable or still syncing — try again shortly.";
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-xl font-bold">Public Key</h1>
        <span className="chip bg-accent/20 text-accent">key</span>
      </div>

      <div className="card p-4 flex items-center gap-3 flex-wrap">
        <span className="mono text-sm break-all text-white/80">{key}</span>
        <CopyButton text={key} label="public key" />
      </div>

      {err ? (
        <EmptyState icon="🔑" title="Can’t list accounts">{err}</EmptyState>
      ) : accounts.length === 0 ? (
        <EmptyState icon="🔑" title="No accounts found">
          No accounts on this network are currently controlled by this key (or Hyperion hasn’t finished indexing).
        </EmptyState>
      ) : (
        <div className="card">
          <div className="px-4 py-3 border-b border-line text-sm text-white/60">
            Accounts controlled by this key <span className="text-white/40">({accounts.length})</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-4">
            {accounts.map((a) => (
              <a key={a} href={`/account/${a}`}
                className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5 mono text-sm hover:border-accent/50 hover:bg-white/[0.06] transition-colors break-all">
                {a}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
