"use client";
import { useState } from "react";

type Tab = "tokens" | "keys" | "resources" | "auth";

function Ring({ label, used, max }: { label: string; used: number; max: number }) {
  const unlimited = max < 0 || used < 0;
  const pct = unlimited ? 0 : max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-3">
      <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
        <circle cx="34" cy="34" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="6" />
        {!unlimited && (
          <circle
            cx="34" cy="34" r={R} fill="none"
            stroke="url(#g)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100}
            transform="rotate(-90 34 34)"
          />
        )}
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--accent))" />
            <stop offset="100%" stopColor="rgb(var(--glow))" />
          </linearGradient>
        </defs>
        <text x="34" y="38" textAnchor="middle" className="fill-white text-[13px] font-semibold">
          {unlimited ? "∞" : `${pct}%`}
        </text>
      </svg>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-white/45">
          {unlimited ? "Unlimited (testnet)" : `${used.toLocaleString()} / ${max.toLocaleString()}`}
        </div>
      </div>
    </div>
  );
}

export default function AccountTabs({
  acct,
  balances,
}: {
  acct: any;
  balances: { sym: string; amount: string; contract: string }[];
}) {
  const [tab, setTab] = useState<Tab>("tokens");
  const perms: any[] = acct.permissions || [];

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-1.5 text-sm rounded-lg ${tab === id ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="card">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-line overflow-x-auto">
        <TabBtn id="tokens" label={`Tokens (${balances.length})`} />
        <TabBtn id="keys" label={`Keys / Permissions (${perms.length})`} />
        <TabBtn id="resources" label="Resources" />
        <TabBtn id="auth" label="Auth" />
      </div>

      <div className="p-4">
        {tab === "tokens" && (
          balances.length ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {balances.map((b) => (
                <div key={b.sym} className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2.5">
                  <img
                    src={`/tokens/${b.sym}.png`}
                    alt={b.sym}
                    className="w-8 h-8 rounded-full bg-white/5"
                    onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{b.amount}</div>
                    <div className="text-xs text-white/40 mono truncate">{b.contract}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/45 text-sm py-4 text-center">
              No token balances. The XPR token contract (<span className="mono">pulse.token</span>) isn’t deployed on this
              testnet yet — balances light up automatically once it is.
            </p>
          )
        )}

        {tab === "keys" && (
          <div className="space-y-3">
            {perms.map((p) => (
              <div key={p.perm_name} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <div className="text-sm">
                  <span className="font-semibold text-accent">@{p.perm_name}</span>
                  <span className="text-white/40"> · parent {p.parent || "—"} · threshold {p.required_auth.threshold}</span>
                </div>
                {p.required_auth.keys.map((k: any) => (
                  <div key={k.key} className="mono text-xs text-white/60 mt-1.5 break-all">
                    {k.key} <span className="text-white/30">(weight {k.weight})</span>
                  </div>
                ))}
                {(p.required_auth.accounts || []).map((a: any, i: number) => (
                  <div key={i} className="mono text-xs text-glow mt-1.5">
                    {a.permission.actor}@{a.permission.permission} <span className="text-white/30">(weight {a.weight})</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {tab === "resources" && (
          <div className="grid sm:grid-cols-3 gap-5 py-2">
            <Ring label="CPU" used={acct.cpu_limit?.used ?? -1} max={acct.cpu_limit?.max ?? -1} />
            <Ring label="NET" used={acct.net_limit?.used ?? -1} max={acct.net_limit?.max ?? -1} />
            <Ring label="RAM" used={acct.ram_usage ?? 0} max={acct.ram_quota ?? -1} />
          </div>
        )}

        {tab === "auth" && (
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <Row k="Privileged" v={acct.privileged ? "yes" : "no"} />
            <Row k="Created" v={acct.created} mono />
            <Row k="Last code update" v={acct.last_code_update} mono />
            <Row k="CPU weight" v={String(acct.cpu_weight)} />
            <Row k="NET weight" v={String(acct.net_weight)} />
            <Row k="RAM quota" v={acct.ram_quota < 0 ? "Unlimited" : acct.ram_quota?.toLocaleString()} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: any; mono?: boolean }) {
  return (
    <div className="flex justify-between rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2">
      <span className="text-white/45">{k}</span>
      <span className={mono ? "mono text-white/80" : "text-white/80"}>{v ?? "—"}</span>
    </div>
  );
}
