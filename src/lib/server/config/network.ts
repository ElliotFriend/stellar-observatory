import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import type { StellarNetwork } from '$lib/config/network';

export interface NetworkConfig {
    facilitatorUrl: string | undefined;
    facilitatorApiKey: string | undefined;
    rpcUrl: string | undefined;
}

const DEFAULTS: Record<StellarNetwork, { facilitatorUrl: string; rpcUrl: string }> = {
    'stellar:testnet': {
        facilitatorUrl: 'https://x402.org/facilitator',
        rpcUrl: 'https://soroban-testnet.stellar.org',
    },
    'stellar:pubnet': {
        facilitatorUrl: 'https://x402.org/facilitator',
        rpcUrl: '',
    },
};

/**
 * Resolves per-network config from env vars.
 *
 * Lookup order for each value (first non-empty wins):
 *   1. Network-prefixed var  (e.g. TESTNET_FACILITATOR_URL)
 *   2. Unprefixed var        (e.g. FACILITATOR_URL) — backward-compatible
 *   3. Built-in default      (only for facilitatorUrl and rpcUrl)
 */
export function getNetworkConfig(network: StellarNetwork): NetworkConfig {
    const prefix = network === 'stellar:testnet' ? 'TESTNET' : 'PUBNET';
    const defaults = DEFAULTS[network];

    return {
        facilitatorUrl:
            env[`${prefix}_FACILITATOR_URL`] || env.FACILITATOR_URL || defaults.facilitatorUrl,
        facilitatorApiKey:
            env[`${prefix}_FACILITATOR_API_KEY`] || env.FACILITATOR_API_KEY || undefined,
        rpcUrl:
            publicEnv[`PUBLIC_${prefix}_RPC_URL`] ||
            publicEnv.PUBLIC_STELLAR_RPC_URL ||
            defaults.rpcUrl ||
            undefined,
    };
}

/**
 * Returns the public RPC URL for a given network (safe for client use).
 */
export function getRpcUrl(network: StellarNetwork): string | undefined {
    const prefix = network === 'stellar:testnet' ? 'TESTNET' : 'PUBNET';
    return (
        publicEnv[`PUBLIC_${prefix}_RPC_URL`] ||
        publicEnv.PUBLIC_STELLAR_RPC_URL ||
        DEFAULTS[network].rpcUrl ||
        undefined
    );
}
