# Pulse Explorer — consolidated build spec

Stylish block explorer for the **XPR Network Pulse Testnet** (PulseVM, Antelope-compatible). Same product family as the native pulse-wallet. Deployed on Vercel; will live at testnet.explorer.pulsevm.dev (mainnet → explorer.pulsevm.dev).

## Endpoints
- **PulseVM JSON-RPC** (always-on): `https://5.78.114.28.sslip.io` → `rpc.testnet.pulsevm.dev` (pending DNS). Methods: `pulsevm.getInfo`, `getAccount`, `getBlock {block_num_or_id: STRING}`, `getCurrencyStats`, `getCurrencyBalance`, `getTableRows {…, key_type required}`, `getTableByScope {…, table required}`. No `getProducers` (derive from `eosio/producers` table).
- **Hyperion v2** (history/state, enhancement): to be launched on our node. A-Chain reference: `https://hyperion.a-chain-testnet.protonnz.com` (v3.6.0-beta.5). Endpoints: `/v2/health`, `/v2/history/get_actions|get_transaction|get_block|get_transfers|get_created_accounts|get_creator|get_abi_snapshot`, `/v2/state/get_tokens|get_key_accounts|get_voters|get_links|get_proposals`.
- Capability-gate Hyperion behind `/v2/health`; degrade gracefully (RPC-only) when absent.

## Design tokens (port from pulse-wallet Design/Theme.swift)
- bg gradient `#0B1437 → #14224F`; `primary #2348C8`, `accent #4F7CFF`, `glow #8B95FF`; `success #3DD68C`, `warn #F5A524`, `danger #FF5A5A`. corners 16px, padding 20px, gutter 16px.
- **GlassCard**: `rounded-2xl bg-white/[0.055] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`.
- **brandGradient** (hero numbers): `bg-gradient-to-br from-[#4F7CFF] to-[#8B95FF] bg-clip-text text-transparent`.
- mono for ids/keys/hashes. numericText roll on refresh. 6 themes (Pulse/Mono/Nord/Dracula/Tokyo Night/Solarized) as CSS vars — match the wallet's theme switcher.

## Pages (IA)
- `/` — homepage: chain-info hero (head/LIB, chain id, version, producer), network health (head-vs-LIB halt detector), **live block lane** + **action stream** (Hyperion stream client), key stats.
- `/accounts` — searchable accounts directory (32k+ mirrored) + **rich list** (top holders).
- `/account/[name]` — balances/tokens, NFTs, resources rings (CPU/NET/RAM, handle `-1`=Unlimited), permission tree, activity (Hyperion), contract/ABI table browser. "Reclaimed from XPR testnet" badge.
- `/block/[id]` — block detail + txs. `/tx/[id]` — **action-trace tree** ("The Decoder"). `/action/[gseq]`.
- `/tokens` + `/token/[sym]` — token list, supply, holders, transfers.
- `/supply` — total/circulating/staked XPR, inflation, distribution viz.
- `/producers` — BP leaderboard + voting. `/oracles` — data feeds. `/resources` — buy CPU/NET/RAM (proton-resources port → resources.pulsevm.dev).
- footer: link to **pulsevm.dev** + GitHub.

## Key implementation notes (from live probing)
- `getBlock` needs `block_num_or_id` as **STRING** — fix lib/rpc.ts (`String(id)`).
- Resource limits: `-1` sentinel = unlimited/resource-model-off → render "Unlimited (testnet)", not 0%.
- `getCurrencyBalance/Stats` 500 when token contract has no rows → wrap in try/empty-state.
- Two-tier data layer: PulseRPC (always) + Hyperion (gated on /v2/health).

## Wow features (CEO/CTO)
- Live animated block lane + action stream; chain "heartbeat" + LIB-chase bar (doubles as halt detector); "The Decoder" tx action-trace tree with hex→JSON morph; key-control graph ("this key also controls…"); rich-list whale-watch; theme switcher matching the wallet; "Reclaimed from XPR testnet" provenance badges; trustless verify toggle (RPC vs indexer).

> Full per-area research reports from the 5 design agents are appended in docs/research/ as they complete. This spec is the synthesis driving the build.

## Additional requirements (from review, 2026-06-14)
- **Global search with default-contract suggestions** (bloks-style dropdown on focus). ✅ built (components/Search.tsx).
- **Contract browser** on account pages: Tables / Actions / ABI tabs. Tables → select table, enter scope/bounds/limit → query rows (getTableRows). Actions → select action → ABI-generated input form → **Submit Transaction** (hand off to Pulse Wallet via pulsevm:// for signing).
- **Login (dual mode):** "PulseVM Wallet" login (pulse-web-sdk) + "WebAuth (Pulse fork)" login (proton-web-sdk-pulse). Powers tx submission + the "you (active)" session like bloks' top-right.
- **Transaction detail** with tabs: Actions / Traces / RAM Deltas / Signers / Raw; status (executed/irreversible), CPU/NET billed, block link. (Needs Hyperion get_transaction.)
- **Transactions list** with category filters (Receive/Send Token, Contract, Account, RAM/CPU/NET, Producer, Vote), contract/action filter, date filter, token filter, memo search. (Needs Hyperion get_actions.)
- **Account page** Chain Data tabs: Tokens / Keys / Votes / NFTs / Children / Auth; liquid/staked balances, USD value.
- **Oracles** feeds dashboard; **Supply** page; **Rich list**; **Accounts directory** (searchable, 32k mirrored).
