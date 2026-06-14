// Shared wallet/session types for the explorer's connect + action-execution flow.

export type LoginMethod = "pulsevm" | "webauth" | "cli";

export interface WalletSession {
  method: LoginMethod;
  actor: string;
  permission: string;
  publicKey?: string;
}

export interface ActionDef {
  account: string;
  name: string;
  authorization: { actor: string; permission: string }[];
  data: Record<string, unknown>;
}

export interface TransactResult {
  transactionId?: string;
  broadcast: boolean;
}
