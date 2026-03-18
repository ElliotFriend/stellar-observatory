import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
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
        expect(getNetworkPassphrase('stellar:testnet')).toBe('Test SDF Network ; September 2015');
    });

    it('getNetworkPassphrase returns pubnet passphrase', async () => {
        const { getNetworkPassphrase } = await import('$lib/config/network.js');
        expect(getNetworkPassphrase('stellar:pubnet')).toBe(
            'Public Global Stellar Network ; September 2015',
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

describe('NETWORK_COOKIE_NAME', () => {
    it('exports the correct cookie name', async () => {
        const { NETWORK_COOKIE_NAME } = await import('$lib/config/network.js');
        expect(NETWORK_COOKIE_NAME).toBe('stellar_network');
    });
});

describe('getNetworkFromCookie', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns testnet when cookie is stellar:testnet', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('stellar:testnet')).toBe('stellar:testnet');
    });

    it('returns pubnet when cookie is stellar:pubnet', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('stellar:pubnet')).toBe('stellar:pubnet');
    });

    it('falls back to env var when cookie is undefined', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie(undefined)).toBe('stellar:testnet');
    });

    it('falls back to env var when cookie is empty string', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('')).toBe('stellar:testnet');
    });

    it('falls back to env var when cookie is an invalid value', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('invalid:network')).toBe('stellar:testnet');
    });

    it('falls back to env var when cookie is a partial match', async () => {
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('stellar:mainnet')).toBe('stellar:testnet');
    });

    it('falls back to testnet when cookie and env are both invalid', async () => {
        vi.doMock('$env/dynamic/public', () => ({
            env: { PUBLIC_STELLAR_NETWORK: 'invalid' },
        }));
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie('also-invalid')).toBe('stellar:testnet');
    });

    it('falls back to testnet when cookie is undefined and env is missing', async () => {
        vi.doMock('$env/dynamic/public', () => ({
            env: {},
        }));
        const { getNetworkFromCookie } = await import('$lib/config/network.js');
        expect(getNetworkFromCookie(undefined)).toBe('stellar:testnet');
    });
});
