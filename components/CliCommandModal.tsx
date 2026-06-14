"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cliCommand, CLI_LABELS, type CliFlavor } from "@/lib/wallet/cli";
import type { ActionDef } from "@/lib/wallet/types";

const FLAVORS: CliFlavor[] = ["cleos", "eosc", "pulse"];

export default function CliCommandModal({ actions, onClose }: { actions: ActionDef[]; onClose: () => void }) {
  const [flavor, setFlavor] = useState<CliFlavor>("cleos");
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cmd = cliCommand(flavor, actions);

  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 overflow-y-auto" style={{ background: "rgb(4 8 22 / 0.7)" }} onClick={onClose}>
      <div className="w-full max-w-2xl my-auto rounded-2xl border border-white/10 bg-[rgb(10_16_40)] p-5 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Run this command to sign</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="flex gap-2 mb-3">
          {FLAVORS.map((f) => (
            <button key={f} onClick={() => setFlavor(f)}
              className={`px-3 py-1.5 text-sm rounded-lg ${flavor === f ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"}`}>{CLI_LABELS[f]}</button>
          ))}
        </div>
        <pre className="mono text-xs bg-black/40 rounded-lg p-3 overflow-auto max-h-72 whitespace-pre-wrap break-all">{cmd}</pre>
        <div className="flex justify-end mt-3">
          <button
            onClick={async () => { try { await navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium">{copied ? "Copied ✓" : "Copy to clipboard"}</button>
        </div>
        <p className="text-xs text-white/40 mt-2">Paste into a terminal where your key is configured. Dev mode never touches your keys in the browser.</p>
      </div>
    </div>,
    document.body
  );
}
