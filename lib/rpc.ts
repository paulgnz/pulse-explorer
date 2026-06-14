// PulseVM JSON-RPC client for the XPR Network Pulse Testnet.
export const RPC = process.env.NEXT_PUBLIC_RPC || "https://5.78.114.28.sslip.io";
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "XPR Network Pulse Testnet";

async function call<T = any>(method: string, params: any = {}): Promise<T> {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "rpc error");
  return j.result as T;
}

export interface ChainInfo {
  chain_id: string; head_block_num: number; last_irreversible_block_num: number;
  head_block_producer: string; head_block_time: string; server_version: string;
  head_block_id: string;
}
export const getInfo = () => call<ChainInfo>("pulsevm.getInfo");
export const getBlock = (id: number | string) => call<any>("pulsevm.getBlock", { block_num_or_id: id });
export const getAccount = (account_name: string) => call<any>("pulsevm.getAccount", { account_name });
export const getCurrencyBalance = (code: string, account: string, symbol?: string) =>
  call<string[]>("pulsevm.getCurrencyBalance", { code, account, symbol });

export const getAbi = (account_name: string) => call<any>("pulsevm.getAbi", { account_name });
export const getTableRows = (p: { code: string; scope: string; table: string; limit?: number; lower_bound?: string; upper_bound?: string; reverse?: boolean; key_type?: string; index_position?: string; json?: boolean }) =>
  call<any>("pulsevm.getTableRows", { json: true, limit: 50, key_type: "i64", index_position: "1", ...p });

export async function recentBlocks(head: number, n = 12) {
  const nums: number[] = [];
  for (let i = head; i > Math.max(0, head - n); i--) nums.push(i);
  const out = await Promise.allSettled(nums.map((x) => getBlock(x)));
  return out.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
}
