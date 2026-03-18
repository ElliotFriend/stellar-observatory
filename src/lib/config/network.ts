import { env } from '$env/dynamic/public';

export type StellarNetwork = 'stellar:testnet' | 'stellar:pubnet';

export const NETWORK_COOKIE_NAME = 'stellar_network';

const VALID_NETWORKS: StellarNetwork[] = ['stellar:testnet', 'stellar:pubnet'];

const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
    'stellar:testnet': 'Test SDF Network ; September 2015',
    'stellar:pubnet': 'Public Global Stellar Network ; September 2015',
};

export function getNetworkFromCookie(cookieValue?: string): StellarNetwork {
    if (cookieValue && VALID_NETWORKS.includes(cookieValue as StellarNetwork)) {
        return cookieValue as StellarNetwork;
    }
    const envNetwork = env.PUBLIC_STELLAR_NETWORK as StellarNetwork;
    if (envNetwork && VALID_NETWORKS.includes(envNetwork)) {
        return envNetwork;
    }
    return 'stellar:testnet';
}

export function getNetwork(): StellarNetwork {
    const network = env.PUBLIC_STELLAR_NETWORK as StellarNetwork;
    if (!network || !NETWORK_PASSPHRASES[network]) {
        return 'stellar:testnet';
    }
    return network;
}

export function getNetworkPassphrase(network?: StellarNetwork): string {
    return NETWORK_PASSPHRASES[network ?? getNetwork()];
}

export function isTestnet(network?: StellarNetwork): boolean {
    return (network ?? getNetwork()) === 'stellar:testnet';
}
