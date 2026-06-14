// Hyperion v2 client — history/state enhancement layer.
// All calls are GATED behind /v2/health. When NEXT_PUBLIC_HYPERION is unset or
// the node is unhealthy, callers should degrade gracefully to RPC-only / empty states.
export const HYPERION = process.env.NEXT_PUBLIC_HYPERION || "";

export function hyperionConfigured() {
  return !!HYPERION;
}

async function hget<T = any>(path: string, signal?: AbortSignal): Promise<T> {
  const base = HYPERION.replace(/\/$/, "");
  const r = await fetch(`${base}${path}`, { cache: "no-store", signal });
  if (!r.ok) throw new Error(`hyperion ${r.status}`);
  return (await r.json()) as T;
}

export interface HealthResult {
  version?: string;
  health?: { service: string; status: string; service_data?: any }[];
}

// Returns null when Hyperion is not configured or unreachable.
export async function getHealth(): Promise<HealthResult | null> {
  if (!HYPERION) return null;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 6000);
    const h = await hget<HealthResult>("/v2/health", ac.signal);
    clearTimeout(t);
    return h;
  } catch {
    return null;
  }
}

// True only when Hyperion is configured AND every service reports OK.
export async function isHealthy(): Promise<boolean> {
  const h = await getHealth();
  if (!h?.health?.length) return false;
  return h.health.every((s) => s.status === "OK");
}

export function getActions(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as any).toString();
  return hget(`/v2/history/get_actions?${qs}`);
}
export function getTransaction(id: string) {
  return hget(`/v2/history/get_transaction?id=${id}`);
}
export function getCreatedAccounts(account: string) {
  return hget(`/v2/history/get_created_accounts?account=${account}`);
}
export function getKeyAccounts(publicKey: string) {
  return hget(`/v2/state/get_key_accounts?public_key=${publicKey}`);
}
export function getTokens(account: string) {
  return hget(`/v2/state/get_tokens?account=${account}`);
}
