"use client";
import { useEffect, useState } from "react";
import { getAbiSnapshot } from "@/lib/hyperion";

const cache = new Map<string, any>();

/** Fetch + memoize a contract ABI snapshot (the node has no getAbi). */
export function useAbi(contract: string) {
  const [abi, setAbi] = useState<any>(cache.get(contract) ?? null);
  useEffect(() => {
    let live = true;
    if (cache.has(contract)) {
      setAbi(cache.get(contract));
      return;
    }
    (async () => {
      const a = await getAbiSnapshot(contract);
      if (!live) return;
      if (a) cache.set(contract, a);
      setAbi(a);
    })();
    return () => {
      live = false;
    };
  }, [contract]);
  return abi;
}

/** Format a numeric amount as a chain asset string: "1.2300 XPR" (precision dp). */
export function asset(amount: string | number, symbol: string, precision = 4): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  const v = isFinite(n) ? n : 0;
  return `${v.toFixed(precision)} ${symbol}`;
}

/** Pull the numeric part out of a chain balance string like "12.3456 XPR". */
export function parseAmount(balance?: string): number {
  if (!balance) return 0;
  const n = parseFloat(balance.split(" ")[0]);
  return isFinite(n) ? n : 0;
}
