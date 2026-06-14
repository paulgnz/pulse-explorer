"use client";
import { useEffect, useState } from "react";
import { handleCallback } from "@/lib/wallet/transport";

export default function ConnectCallback() {
  const [kind, setKind] = useState<"login" | "sign" | "none" | null>(null);

  useEffect(() => {
    const k = handleCallback();
    setKind(k ?? "none");
    if (k) setTimeout(() => window.close(), 800);
  }, []);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="glass-card text-center max-w-sm">
        {kind === null && <p className="text-white/60">Completing…</p>}
        {kind === "login" && <p className="text-success font-medium">Connected ✓ You can close this tab.</p>}
        {kind === "sign" && <p className="text-success font-medium">Signed ✓ You can close this tab.</p>}
        {kind === "none" && (
          <>
            <p className="text-white/60 mb-1">Nothing to handle here.</p>
            <a href="/" className="text-accent text-sm">← Back to the explorer</a>
          </>
        )}
      </div>
    </div>
  );
}
