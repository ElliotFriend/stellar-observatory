import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
	env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' }
}));

describe('network config', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('getNetwork returns testnet by default', async () => {
		const { getNetwork } = await import('$lib/config/network.js');
		expect(getNetwork()).toBe('stellar:testnet');
	});

	it('getNetworkPassphrase returns testnet passphrase', async () => {
		const { getNetworkPassphrase } = await import('$lib/config/network.js');
		expect(getNetworkPassphrase('stellar:testnet')).toBe(
			'Test SDF Network ; September 2015'
		);
	});

	it('getNetworkPassphrase returns pubnet passphrase', async () => {
		const { getNetworkPassphrase } = await import('$lib/config/network.js');
		expect(getNetworkPassphrase('stellar:pubnet')).toBe(
			'Public Global Stellar Network ; September 2015'
		);
	});

	it('isTestnet returns true for testnet', async () => {
		const { isTestnet } = await import('$lib/config/network.js');
		expect(isTestnet('stellar:testnet')).toBe(true);
	});

	it('isTestnet returns false for pubnet', async () => {
		const { isTestnet } = await import('$lib/config/network.js');
		expect(isTestnet('stellar:pubnet')).toBe(false);
	});
});
