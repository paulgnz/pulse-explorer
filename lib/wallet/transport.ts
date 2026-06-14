// pulsevm:// deep-link transport for the native Pulse Wallet (desktop).
// Vendored/adapted from @pulsevm/pulse-web-sdk: trigger the scheme via a hidden
// iframe so the page stays put; the wallet redirects to our /connect callback,
// which writes the result to localStorage, resolving the pending promise here.
// No relay server required.

const LOGIN_KEY = "pulse.login.result";
const SIGN_KEY = "pulse.sign.result";

function triggerScheme(url: string) {
  const f = document.createElement("iframe");
  f.style.display = "none";
  f.src = url;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1500);
}

function awaitResult(key: string, timeoutMs = 120_000): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const check = () => {
      const v = localStorage.getItem(key);
      if (v) {
        cleanup();
        localStorage.removeItem(key);
        resolve(JSON.parse(v));
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) check();
    };
    const poll = setInterval(check, 400);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Wallet request timed out — is the Pulse Wallet open?"));
    }, timeoutMs);
    function cleanup() {
      clearInterval(poll);
      clearTimeout(timer);
      removeEventListener("storage", onStorage);
    }
    addEventListener("storage", onStorage);
    check();
  });
}

const callbackURL = () => `${location.origin}/connect`;

export async function walletLogin(): Promise<{ actor: string; permission: string; publicKey?: string }> {
  localStorage.removeItem(LOGIN_KEY);
  triggerScheme(`pulsevm://login?callback=${encodeURIComponent(callbackURL())}`);
  const r = await awaitResult(LOGIN_KEY);
  if (!r.account) throw new Error(r.error || "Login was cancelled");
  return { actor: r.account, permission: r.permission || "active", publicKey: r.publicKey };
}

export async function walletSign(p: { chainId: string; packedTrx: string; summary?: string }): Promise<{ transactionId?: string }> {
  localStorage.removeItem(SIGN_KEY);
  const q = new URLSearchParams({
    chain_id: p.chainId,
    packed_trx: p.packedTrx,
    callback: callbackURL(),
  });
  if (p.summary) q.set("summary", p.summary);
  triggerScheme(`pulsevm://sign?${q.toString()}`);
  const r = await awaitResult(SIGN_KEY);
  if (r.error) throw new Error(r.error);
  return { transactionId: r.transaction_id || r.transactionId };
}

/**
 * Called on the /connect callback page. If this load carries wallet result
 * params, stash them for the originating tab and return the kind handled.
 */
export function handleCallback(): "login" | "sign" | null {
  const p = new URLSearchParams(location.search);
  if (p.get("account")) {
    localStorage.setItem(
      LOGIN_KEY,
      JSON.stringify({
        account: p.get("account"),
        permission: p.get("permission") || "active",
        publicKey: p.get("publicKey") || p.get("public_key") || "",
      })
    );
    return "login";
  }
  if (p.get("transaction_id") || p.get("transactionId") || p.get("signed") || p.get("error")) {
    localStorage.setItem(
      SIGN_KEY,
      JSON.stringify({
        transaction_id: p.get("transaction_id") || p.get("transactionId") || "",
        error: p.get("error") || "",
      })
    );
    return "sign";
  }
  return null;
}
