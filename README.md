# Stellar Observatory

A space/astronomy data API powered by [x402](https://x402.org) micropayments on the [Stellar](https://stellar.org) network. Built with SvelteKit 5, Tailwind CSS v4, and Stellar Wallets Kit v2.

No API keys. No subscriptions. Just connect a Stellar wallet and pay per request.

## Endpoints

| Endpoint                       | Price  | Data                                                     |
| ------------------------------ | ------ | -------------------------------------------------------- |
| `GET /api/space-weather`       | $0.001 | Solar wind, geomagnetic storms, flares, aurora forecast  |
| `GET /api/near-earth-objects`  | $0.01  | Approaching asteroids and comets within 30 days          |
| `GET /api/exoplanets`          | $0.05  | Confirmed exoplanets with habitability scores            |
| `GET /api/deep-sky-catalog`    | $0.10  | Galaxies, nebulae, clusters with imaging recommendations |
| `GET /api/gravitational-waves` | $0.25  | LIGO/Virgo gravitational wave detection events           |

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Copy and modify the Svelte MCP server, if desired
cp .mcp.json.example .mcp.json

# Start dev server
pnpm dev
```

Open [localhost:5173](http://localhost:5173), connect a Stellar testnet wallet (e.g. [Freighter](https://freighter.app)), and start exploring.

## How It Works

1. **Browse** — the landing page shows all endpoints with free preview data
2. **Connect** — click "Connect Wallet" to link a Stellar wallet via Freighter, xBull, or other SEP-43 wallets
3. **Pay** — click "Fetch Data" on any endpoint; your wallet signs a USDC payment for the listed price
4. **Receive** — the x402 protocol verifies payment and returns the full dataset

Under the hood, the [x402 protocol](https://x402.org) handles the entire flow:

- Server responds with `402 Payment Required` + payment requirements in headers
- Client creates and signs a Stellar transaction via the connected wallet
- Client retries the request with the signed payment in headers
- Server verifies payment through the x402 facilitator and returns data

## Project Structure

```text
src/
├── lib/
│   ├── components/    # Svelte 5 UI components
│   ├── config/        # Endpoint registry + network config
│   ├── data/          # Mock data modules (one per endpoint)
│   ├── types/         # TypeScript interfaces for all API responses
│   └── wallet/        # Wallet adapter, x402 client, reactive store
├── routes/
│   ├── api/           # 5 x402-protected API endpoints
│   └── explore/       # Endpoint detail pages with pay-to-fetch
└── tests/             # Unit, API, wallet, and integration tests

mcp-server/            # MCP server for AI agent access
```

## Environment Variables

```bash
# Network: "stellar:testnet" or "stellar:pubnet"
PUBLIC_STELLAR_NETWORK=stellar:testnet

# Server-side only
PAYTO_ADDRESS=G...         # Stellar address to receive payments
FACILITATOR_URL=https://x402.org/facilitator
```

`PUBLIC_` prefix makes the variable available in the browser ([SvelteKit convention](https://svelte.dev/docs/kit/$env-dynamic-public)). Everything else is server-only.

## Testing

```bash
# Run all tests
pnpm test

# Run server tests only (faster, no browser needed)
pnpm exec vitest --run --project server

# Run MCP server tests
pnpm --filter stellar-observatory-mcp exec vitest run
```

## MCP Server

An [MCP](https://modelcontextprotocol.io) server lets AI agents (Claude, etc.) access the paid endpoints using a Stellar secret key.

```bash
# Build the MCP server
cd mcp-server && pnpm install && pnpm build && cd ..

# Modify the `stellar-observatory` MCP server in `.mcp.json` with your secret key
# Note: the account should be funded, and have a USDC trustline and balance.

# Add to Claude Code
claude mcp add -s user \
  stellar-observatory -- node ./mcp-server/build/index.js
```

Then ask Claude: _"Get the current space weather data"_ or _"Show me the most habitable exoplanets"_.

See [`mcp-server/README.md`](mcp-server/README.md) for full setup details.

## Tech Stack

- **[SvelteKit 5](https://svelte.dev)** — full-stack framework with SSR
- **[Tailwind CSS v4](https://tailwindcss.com)** — utility-first styling with custom space theme
- **[x402](https://x402.org)** — HTTP 402 payment protocol (`@x402/core`, `@x402/stellar`, `x402-sveltekit`)
- **[Stellar Wallets Kit v2](https://github.com/nicholasgasior/stellar-wallets-kit)** — browser wallet integration (Freighter, xBull, etc.)
- **[MCP SDK](https://modelcontextprotocol.io)** — AI agent tool server
- **[Vitest](https://vitest.dev)** — unit and component testing
