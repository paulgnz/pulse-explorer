"use client";
import { useEffect, useState } from "react";
import { getAccount, SYSTEM } from "@/lib/rpc";
import type { ActionDef } from "@/lib/wallet/types";
import { useAbi } from "./abiCache";
import { useSubmitFlow, SubmitFlowModals, SubmitBar, authFromKey } from "./submitFlow";

type Tab = "updateauth" | "linkauth" | "unlinkauth" | "deleteauth";

const Field = ({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block text-xs text-white/50">
    {label}
    <input {...rest} className="pulse-field block mt-1 w-full px-3 py-2 text-sm mono" />
  </label>
);

export default function KeysView() {
  const flow = useSubmitFlow();
  const abi = useAbi(SYSTEM);
  const [tab, setTab] = useState<Tab>("updateauth");
  const [perms, setPerms] = useState<any[]>([]);

  // updateauth
  const [permission, setPermission] = useState("active");
  const [parent, setParent] = useState("owner");
  const [key, setKey] = useState("");
  // linkauth / unlinkauth
  const [code, setCode] = useState("");
  const [type, setType] = useState("");
  const [requirement, setRequirement] = useState("active");
  // deleteauth
  const [delPerm, setDelPerm] = useState("");

  const actor = flow.session?.actor;
  useEffect(() => {
    if (!actor) return;
    let live = true;
    getAccount(actor)
      .then((a) => live && setPerms(a?.permissions || []))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [actor, flow.result]);

  function buildUpdate(): ActionDef[] {
    if (!key.trim()) throw new Error("Enter the public key to set");
    return [
      {
        account: SYSTEM,
        name: "updateauth",
        authorization: [],
        data: { account: actor!, permission: permission.trim(), parent: parent.trim(), auth: authFromKey(key) },
      },
    ];
  }
  function buildLink(): ActionDef[] {
    if (!code.trim() || !type.trim()) throw new Error("Enter the contract (code) and action (type)");
    return [
      {
        account: SYSTEM,
        name: "linkauth",
        authorization: [],
        data: { account: actor!, code: code.trim(), type: type.trim(), requirement: requirement.trim() },
      },
    ];
  }
  function buildUnlink(): ActionDef[] {
    if (!code.trim() || !type.trim()) throw new Error("Enter the contract (code) and action (type)");
    return [
      {
        account: SYSTEM,
        name: "unlinkauth",
        authorization: [],
        data: { account: actor!, code: code.trim(), type: type.trim() },
      },
    ];
  }
  function buildDelete(): ActionDef[] {
    if (!delPerm.trim()) throw new Error("Enter the permission to delete");
    return [
      { account: SYSTEM, name: "deleteauth", authorization: [], data: { account: actor!, permission: delPerm.trim() } },
    ];
  }

  const builders: Record<Tab, () => ActionDef[]> = {
    updateauth: buildUpdate,
    linkauth: buildLink,
    unlinkauth: buildUnlink,
    deleteauth: buildDelete,
  };

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
        <h1 className="text-xl font-bold">Keys &amp; Permissions</h1>
        <p className="text-sm text-white/45 mt-1">
          Manage authorities on your account (<span className="mono">{actor || "—"}</span>) via the system contract.
        </p>
      </div>

      {perms.length > 0 && (
        <div className="glass-card space-y-2">
          <div className="text-xs text-white/50 mb-1">Current permissions</div>
          {perms.map((p) => (
            <div key={p.perm_name} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
              <div className="text-sm">
                <span className="font-semibold text-accent">@{p.perm_name}</span>
                <span className="text-white/40"> · parent {p.parent || "—"} · threshold {p.required_auth?.threshold}</span>
              </div>
              {(p.required_auth?.keys || []).map((k: any) => (
                <div key={k.key} className="mono text-xs text-white/60 mt-1.5 break-all">
                  {k.key} <span className="text-white/30">(weight {k.weight})</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="glass-card space-y-4">
        <div className="flex flex-wrap gap-2">
          <TabBtn id="updateauth" label="Update / Add Key" />
          <TabBtn id="linkauth" label="Link Auth" />
          <TabBtn id="unlinkauth" label="Unlink Auth" />
          <TabBtn id="deleteauth" label="Delete Permission" />
        </div>

        {tab === "updateauth" && (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Permission" value={permission} onChange={(e) => setPermission(e.target.value)} placeholder="active" />
              <Field label="Parent" value={parent} onChange={(e) => setParent(e.target.value)} placeholder="owner" />
            </div>
            <Field label="Public key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="PUB_K1_… (replaces the permission's auth)" />
          </div>
        )}

        {(tab === "linkauth" || tab === "unlinkauth") && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Code (contract)" value={code} onChange={(e) => setCode(e.target.value.toLowerCase())} placeholder="pulse.token" />
            <Field label="Type (action)" value={type} onChange={(e) => setType(e.target.value.toLowerCase())} placeholder="transfer" />
            {tab === "linkauth" && (
              <Field label="Requirement (permission)" value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="active" />
            )}
          </div>
        )}

        {tab === "deleteauth" && (
          <Field label="Permission to delete" value={delPerm} onChange={(e) => setDelPerm(e.target.value)} placeholder="e.g. custom" />
        )}

        <SubmitBar
          flow={flow}
          idle="Submit & sign →"
          onClick={() => flow.run(builders[tab], abi)}
          note={`${SYSTEM}::${tab} · system contract ABI.`}
        />
      </div>

      <SubmitFlowModals flow={flow} />
    </div>
  );
}
