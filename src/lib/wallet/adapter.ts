import type { ClientStellarSigner } from '@x402/stellar';

/**
 * Creates a ClientStellarSigner from StellarWalletsKit.
 * Bridges the wallet kit's signAuthEntry/signTransaction to the SEP-43 interface
 * expected by x402's ExactStellarScheme client.
 *
 * Uses dynamic import to avoid SSR issues with @stellar/freighter-api.
 */
export function createWalletKitSigner(
	address: string,
	networkPassphrase: string
): ClientStellarSigner {
	return {
		address,
		signAuthEntry: async (authEntry: string, opts?: { networkPassphrase?: string; address?: string }) => {
			const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit');
			return StellarWalletsKit.signAuthEntry(authEntry, {
				address: opts?.address ?? address,
				networkPassphrase: opts?.networkPassphrase ?? networkPassphrase
			});
		},
		signTransaction: async (xdr: string, opts?: { networkPassphrase?: string; address?: string }) => {
			const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit');
			return StellarWalletsKit.signTransaction(xdr, {
				address: opts?.address ?? address,
				networkPassphrase: opts?.networkPassphrase ?? networkPassphrase
			});
		}
	};
}
