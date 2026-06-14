// Emit terminal commands for the "act-as / CLI dev mode" — no keys, the user
// pastes the command into their own cleos / eosc / pulse-cli-ts session.
import { RPC } from "@/lib/rpc";
import type { ActionDef } from "./types";

export type CliFlavor = "cleos" | "eosc" | "pulse";

function txJson(actions: ActionDef[]) {
  return {
    actions: actions.map((a) => ({
      account: a.account,
      name: a.name,
      authorization: a.authorization,
      data: a.data,
    })),
  };
}

export function cliCommand(flavor: CliFlavor, actions: ActionDef[]): string {
  const a = actions[0];
  const auth = a.authorization.map((x) => `${x.actor}@${x.permission}`).join(" -p ");
  const dataJson = JSON.stringify(a.data);
  switch (flavor) {
    case "cleos":
      // cleos pushes a full transaction or a single action
      return `cleos -u ${RPC} push action ${a.account} ${a.name} '${dataJson}' -p ${auth}`;
    case "eosc":
      return `eosc -u ${RPC} tx create ${a.account} ${a.name} '${dataJson}' -p ${a.authorization
        .map((x) => `${x.actor}@${x.permission}`)
        .join(",")}`;
    case "pulse":
      // pulse-cli-ts (Proton CLI fork): push a raw transaction JSON
      return `pulse transaction:push -u ${RPC} '${JSON.stringify(txJson(actions))}'`;
  }
}

export const CLI_LABELS: Record<CliFlavor, string> = {
  cleos: "cleos (Antelope)",
  eosc: "eosc",
  pulse: "pulse-cli-ts",
};
