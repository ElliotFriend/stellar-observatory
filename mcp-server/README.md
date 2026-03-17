# Stellar Observatory MCP Server

An MCP (Model Context Protocol) server that gives AI agents access to the Stellar Observatory's x402-protected API endpoints. The agent pays for each request using a Stellar account.

## Setup

### 1. Install & Build

```bash
cd mcp-server
pnpm install
pnpm build
```

### 2. Add to Claude Code

```bash
claude mcp add -s user \
  -e STELLAR_SECRET_KEY=S... \
  -e OBSERVATORY_BASE_URL=http://localhost:5173 \
  -e STELLAR_NETWORK=stellar:testnet \
  stellar-observatory -- node ./mcp-server/build/index.js
```

### 3. Environment Variables

| Variable               | Required | Default                 | Description                                                |
| ---------------------- | -------- | ----------------------- | ---------------------------------------------------------- |
| `STELLAR_SECRET_KEY`   | Yes      | —                       | Stellar secret key (S...) for signing payments             |
| `OBSERVATORY_BASE_URL` | No       | `http://localhost:5173` | Base URL of the Observatory API                            |
| `STELLAR_NETWORK`      | No       | `stellar:testnet`       | Network identifier (`stellar:testnet` or `stellar:pubnet`) |

## Available Tools

| Tool                      | Price  | Description                                 |
| ------------------------- | ------ | ------------------------------------------- |
| `get-space-weather`       | $0.001 | Solar wind, storms, flares, aurora forecast |
| `get-near-earth-objects`  | $0.01  | Approaching asteroids/comets                |
| `get-exoplanets`          | $0.05  | Exoplanet database with habitability scores |
| `get-deep-sky-catalog`    | $0.10  | Galaxies, nebulae, clusters                 |
| `get-gravitational-waves` | $0.25  | LIGO/Virgo detection events                 |
| `fetch-paid-resource`     | varies | Generic x402 fetcher for any URL            |

## Usage

Once configured, ask Claude:

> "Get the current space weather data"
> "What near-Earth objects are approaching?"
> "Show me the most habitable exoplanets"
