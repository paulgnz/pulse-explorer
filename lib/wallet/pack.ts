// Build an unsigned packed transaction (hex) from action(s) + the contract ABI,
// using current chain head for TAPOS. The Pulse Wallet signs the packed bytes.
import { ABI, Action, Transaction, Serializer } from "@metalblockchain/pulsevm-js";
import { getInfo } from "@/lib/rpc";
import { getAbiSnapshot } from "@/lib/hyperion";
import type { ActionDef } from "./types";

const MSIG = "pulse.msig";

/** uint32 LE from bytes 8..12 of a 32-byte block id hex. */
function refBlockPrefix(blockIdHex: string): number {
  const slice = blockIdHex.slice(16, 24); // bytes 8..11
  const le = (slice.match(/../g) || []).reverse().join("");
  return parseInt(le, 16) >>> 0;
}

export interface PackedContext {
  packedTrxHex: string;
  chainId: string;
}

/** Serialize action data with the contract ABI and pack a TAPOS'd transaction. */
export async function buildPackedTrx(actions: ActionDef[], abiJson: any, expireSec = 120): Promise<PackedContext> {
  const info = await getInfo();
  const abi = ABI.from(abiJson);
  const built = actions.map((a) => Action.from(a as any, abi));

  const exp = new Date(Date.now() + expireSec * 1000).toISOString().slice(0, 19);
  const tx = Transaction.from({
    expiration: exp,
    ref_block_num: info.head_block_num & 0xffff,
    ref_block_prefix: refBlockPrefix(info.head_block_id),
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: built,
    transaction_extensions: [],
  } as any);

  return { packedTrxHex: Serializer.encode({ object: tx }).hexString, chainId: info.chain_id };
}

/** Fetch the pulse.msig ABI (for serializing a propose). Throws if msig isn't deployed. */
export async function msigAbi(): Promise<any> {
  const abi = await getAbiSnapshot(MSIG);
  if (!abi) throw new Error("pulse.msig is not deployed on this network yet");
  return abi;
}

const NAME_CHARS = "12345abcdefghijklmnopqrstuvwxyz";
function randomProposalName(): string {
  // 12-char valid Antelope name from the allowed charset.
  let n = "";
  for (let i = 0; i < 12; i++) n += NAME_CHARS[Math.floor(Math.random() * NAME_CHARS.length)];
  return n;
}

/**
 * Wrap inner actions into a single pulse.msig::propose action. Inner action data
 * is pre-serialized to hex with the target ABI; the outer propose is then packed
 * with the msig ABI by the caller (buildPackedTrx(..., await msigAbi())).
 */
export async function buildMsigPropose(actions: ActionDef[], proposer: string, targetAbiJson: any): Promise<ActionDef[]> {
  const info = await getInfo();
  const tabi = ABI.from(targetAbiJson);
  const exp = new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 19);

  const innerActions = actions.map((a) => ({
    account: a.account,
    name: a.name,
    authorization: a.authorization,
    data: Action.from(a as any, tabi).data.hexString,
  }));

  const trx = {
    expiration: exp,
    ref_block_num: info.head_block_num & 0xffff,
    ref_block_prefix: refBlockPrefix(info.head_block_id),
    max_net_usage_words: 0,
    max_cpu_usage_ms: 0,
    delay_sec: 0,
    context_free_actions: [],
    actions: innerActions,
    transaction_extensions: [],
  };

  return [
    {
      account: MSIG,
      name: "propose",
      authorization: [{ actor: proposer, permission: "active" }],
      data: {
        proposer,
        proposal_name: randomProposalName(),
        requested: [{ actor: proposer, permission: "active" }],
        trx,
      },
    },
  ];
}
