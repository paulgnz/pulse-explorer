# Pulse Explorer

A block explorer for **PulseVM** chains (Antelope/EOSIO-compatible VMs running as
Avalanche subnets via MetalGo). Built with Next.js 14 (App Router) + Tailwind.
Live instance: **[testnet.explorer.pulsevm.dev](https://testnet.explorer.pulsevm.dev)**
(the self-hosted XPR Network Pulse Testnet).

It works against **any** PulseVM RPC endpoint — point the env vars at your own
network and it just works.

## Features

- **Home** — live chain stats, recent blocks & transactions
- **Blocks / Transactions / Tx detail** — decoded actions, traces
- **Accounts** — directory (32k+), rich-list, search
- **Account page** — balances, keys/permissions, resources, auth; **contract browser**
  (Tables / Actions / ABI) with on-chain action execution
- **Tokens / Supply / Producers / Oracles / Resources**
- **Connect Wallet** — Pulse Wallet (desktop, `pulsevm://`), CLI dev-mode
  (emit cleos / eosc / pulse-cli commands), msig-mode toggle, multi-account menu
- **Command palette search** (⌘K) — block # / account / public key / tx id

## Configuration

All config is via `NEXT_PUBLIC_*` env vars (inlined at build time — set them
**before** building/deploying):

| Var | Required | Default | Purpose |
|-----|----------|---------|---------|
| `NEXT_PUBLIC_RPC` | yes | `https://rpc-testnet.pulsevm.dev` | PulseVM JSON-RPC endpoint (`pulsevm.*` methods) |
| `NEXT_PUBLIC_HYPERION` | no | — | Hyperion v2 base URL. Enables history, transfers, get_abi_snapshot (contract ABIs), rich-list. Gated behind `/v2/health` — the explorer degrades to RPC-only when unset/unhealthy. |
| `NEXT_PUBLIC_CHAIN_NAME` | no | `XPR Network Pulse Testnet` | Display name in header/footer |

> The explorer reads the **chain_id dynamically** from `pulsevm.getInfo`, so it
> auto-adapts when a network is relaunched (PulseVM derives the EOSIO chain_id
> from the Avalanche blockchainID, which changes on each MNR relaunch).

PulseVM build notes the explorer already handles:
- No `getAbi`/`getCode` RPC → contract ABIs come from Hyperion `get_abi_snapshot`.
- `getCurrencyStats` unreliable → tokens/supply detected via `getCurrencyBalance`.
- `getAccount.core_liquid_balance` null → balances via `getCurrencyBalance`.
- `getTableRows` requires `key_type:"i64", index_position:"1"` and no empty bounds.
- The native system account is **`pulse`** (not `eosio`); code-permission is `pulse.code`.

## Local development

```sh
npm install
cp .env.local.example .env.local   # or create it (see below)
npm run dev                         # http://localhost:3000
```

`.env.local`:
```
NEXT_PUBLIC_RPC=https://rpc-testnet.pulsevm.dev
NEXT_PUBLIC_HYPERION=https://hyperion-testnet.pulsevm.dev
NEXT_PUBLIC_CHAIN_NAME=XPR Network Pulse Testnet
```

## Deploy (Vercel)

```sh
vercel pull --yes --environment=production     # link + pull settings
vercel build --prod                            # NEXT_PUBLIC_* baked in here
vercel deploy --prebuilt --prod
```
Set the env vars in the Vercel project (Settings → Environment Variables) so the
production build inlines them. Disable deployment protection if you want it public
(`ssoProtection: null`).

## Point it at your own PulseVM network

1. Stand up a PulseVM chain (MetalGo + the pulsevm plugin; single-node via
   metal-network-runner, or join an existing subnet). You'll have a JSON-RPC
   endpoint like `http://host:9650/ext/bc/<blockchainID>/rpc` — front it with
   nginx/Cloudflare for HTTPS + CORS (single `Access-Control-Allow-Origin`).
2. (Optional but recommended) Run **pulsevm-hyperion** (`release/3.6`) against the
   plugin's SHiP socket (`127.0.0.1:9090`) for history + ABIs + rich-list.
3. Set `NEXT_PUBLIC_RPC` (+ `NEXT_PUBLIC_HYPERION`, `NEXT_PUBLIC_CHAIN_NAME`),
   rebuild, deploy. Done — the explorer reads everything else from the chain.

See the companion private repo `pulsevm-experimental` (`wiki/24`) for a full
end-to-end testnet build (node, mirror, contracts, endpoints).

## License

MIT
