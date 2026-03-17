import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@creit-tech/stellar-wallets-kit', () => ({
	StellarWalletsKit: {
		signAuthEntry: vi.fn(),
		signTransaction: vi.fn()
	}
}));

import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
import { createWalletKitSigner } from '$lib/wallet/adapter.js';

const mockKit = vi.mocked(StellarWalletsKit);

describe('createWalletKitSigner', () => {
	const address = 'GABC123';
	const passphrase = 'Test SDF Network ; September 2015';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns a signer with the correct address', () => {
		const signer = createWalletKitSigner(address, passphrase);
		expect(signer.address).toBe(address);
	});

	it('signAuthEntry delegates to StellarWalletsKit', async () => {
		mockKit.signAuthEntry.mockResolvedValue({
			signedAuthEntry: 'signed-auth-entry-xdr'
		});

		const signer = createWalletKitSigner(address, passphrase);
		const result = await signer.signAuthEntry('auth-entry-xdr');

		expect(mockKit.signAuthEntry).toHaveBeenCalledWith('auth-entry-xdr', {
			address,
			networkPassphrase: passphrase
		});
		expect(result.signedAuthEntry).toBe('signed-auth-entry-xdr');
	});

	it('signAuthEntry uses opts override for networkPassphrase', async () => {
		mockKit.signAuthEntry.mockResolvedValue({
			signedAuthEntry: 'signed'
		});

		const signer = createWalletKitSigner(address, passphrase);
		await signer.signAuthEntry('entry', { networkPassphrase: 'custom-passphrase' });

		expect(mockKit.signAuthEntry).toHaveBeenCalledWith('entry', {
			address,
			networkPassphrase: 'custom-passphrase'
		});
	});

	it('signTransaction delegates to StellarWalletsKit', async () => {
		mockKit.signTransaction.mockResolvedValue({
			signedTxXdr: 'signed-tx-xdr'
		});

		const signer = createWalletKitSigner(address, passphrase);
		const result = await signer.signTransaction!('tx-xdr');

		expect(mockKit.signTransaction).toHaveBeenCalledWith('tx-xdr', {
			address,
			networkPassphrase: passphrase
		});
		expect(result.signedTxXdr).toBe('signed-tx-xdr');
	});
});
