import type { ClientStellarSigner } from '@x402/stellar';
import type { Network } from '@x402/core/types';
import { createWalletKitSigner } from '$lib/wallet/adapter';
import { createPaidFetch } from '$lib/wallet/client';

export type WalletState = {
    address: string | null;
    connected: boolean;
    loading: boolean;
    paidFetch: ((url: string, init?: RequestInit) => Promise<Response>) | null;
};

let address = $state<string | null>(null);
let connected = $state(false);
let loading = $state(false);
let signer = $state<ClientStellarSigner | null>(null);
let paidFetch = $state<((url: string, init?: RequestInit) => Promise<Response>) | null>(null);

export function getWalletState(): WalletState {
    return {
        get address() {
            return address;
        },
        get connected() {
            return connected;
        },
        get loading() {
            return loading;
        },
        get paidFetch() {
            return paidFetch;
        },
    };
}

export async function connectWallet(
    network: Network,
    networkPassphrase: string,
    rpcUrl?: string,
): Promise<void> {
    loading = true;

    try {
        const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit');
        const { address: addr } = await StellarWalletsKit.authModal();
        address = addr;
        connected = true;

        signer = createWalletKitSigner(addr, networkPassphrase);
        paidFetch = createPaidFetch(signer, network, rpcUrl);
    } catch (err) {
        console.error('Error connecting wallet', err);
        connected = false;
        address = null;
        signer = null;
        paidFetch = null;
    } finally {
        loading = false;
    }
}

export async function disconnectWallet(): Promise<void> {
    try {
        const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit');
        await StellarWalletsKit.disconnect();
    } catch {
        // Wallet may not support disconnect
    }
    address = null;
    connected = false;
    signer = null;
    paidFetch = null;
}
