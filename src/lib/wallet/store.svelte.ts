import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
import type { ClientStellarSigner } from '@x402/stellar';
import type { Network } from '@x402/core/types';
import { createWalletKitSigner } from './adapter.js';
import { createPaidFetch } from './client.js';

export type WalletState = {
	address: string | null;
	connected: boolean;
	loading: boolean;
	error: string | null;
	paidFetch: ((url: string, init?: RequestInit) => Promise<Response>) | null;
};

let address = $state<string | null>(null);
let connected = $state(false);
let loading = $state(false);
let error = $state<string | null>(null);
let signer = $state<ClientStellarSigner | null>(null);
let paidFetch = $state<((url: string, init?: RequestInit) => Promise<Response>) | null>(null);

export function getWalletState(): WalletState {
	return {
		get address() { return address; },
		get connected() { return connected; },
		get loading() { return loading; },
		get error() { return error; },
		get paidFetch() { return paidFetch; }
	};
}

export async function connectWallet(network: Network, networkPassphrase: string): Promise<void> {
	loading = true;
	error = null;

	try {
		const { address: addr } = await StellarWalletsKit.authModal();
		address = addr;
		connected = true;

		signer = createWalletKitSigner(addr, networkPassphrase);
		paidFetch = createPaidFetch(signer, network);
	} catch (err) {
		error = err instanceof Error ? err.message : String(err);
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
		await StellarWalletsKit.disconnect();
	} catch {
		// Wallet may not support disconnect
	}
	address = null;
	connected = false;
	signer = null;
	paidFetch = null;
	error = null;
}
