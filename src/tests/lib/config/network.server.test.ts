import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrivateEnv: Record<string, string | undefined> = {};
const mockPublicEnv: Record<string, string | undefined> = {};

vi.mock('$env/dynamic/private', () => ({
    env: mockPrivateEnv,
}));

vi.mock('$env/dynamic/public', () => ({
    env: mockPublicEnv,
}));

describe('getNetworkConfig', () => {
    beforeEach(() => {
        vi.resetModules();
        Object.keys(mockPrivateEnv).forEach((k) => delete mockPrivateEnv[k]);
        Object.keys(mockPublicEnv).forEach((k) => delete mockPublicEnv[k]);
    });

    it('uses per-network env vars when set', async () => {
        mockPrivateEnv.TESTNET_FACILITATOR_URL = 'https://testnet.example.com';
        mockPrivateEnv.TESTNET_FACILITATOR_API_KEY = 'testnet-key';
        mockPublicEnv.PUBLIC_TESTNET_RPC_URL = 'https://testnet-rpc.example.com';

        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:testnet');

        expect(config.facilitatorUrl).toBe('https://testnet.example.com');
        expect(config.facilitatorApiKey).toBe('testnet-key');
        expect(config.rpcUrl).toBe('https://testnet-rpc.example.com');
    });

    it('uses per-network env vars for pubnet', async () => {
        mockPrivateEnv.PUBNET_FACILITATOR_URL = 'https://pubnet.example.com';
        mockPrivateEnv.PUBNET_FACILITATOR_API_KEY = 'pubnet-key';
        mockPublicEnv.PUBLIC_PUBNET_RPC_URL = 'https://pubnet-rpc.example.com';

        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:pubnet');

        expect(config.facilitatorUrl).toBe('https://pubnet.example.com');
        expect(config.facilitatorApiKey).toBe('pubnet-key');
        expect(config.rpcUrl).toBe('https://pubnet-rpc.example.com');
    });

    it('falls back to unprefixed env vars', async () => {
        mockPrivateEnv.FACILITATOR_URL = 'https://generic.example.com';
        mockPrivateEnv.FACILITATOR_API_KEY = 'generic-key';
        mockPublicEnv.PUBLIC_STELLAR_RPC_URL = 'https://generic-rpc.example.com';

        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:testnet');

        expect(config.facilitatorUrl).toBe('https://generic.example.com');
        expect(config.facilitatorApiKey).toBe('generic-key');
        expect(config.rpcUrl).toBe('https://generic-rpc.example.com');
    });

    it('per-network vars take priority over unprefixed', async () => {
        mockPrivateEnv.FACILITATOR_URL = 'https://generic.example.com';
        mockPrivateEnv.TESTNET_FACILITATOR_URL = 'https://testnet.example.com';

        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:testnet');

        expect(config.facilitatorUrl).toBe('https://testnet.example.com');
    });

    it('falls back to built-in defaults for testnet', async () => {
        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:testnet');

        expect(config.facilitatorUrl).toBe('https://x402.org/facilitator');
        expect(config.facilitatorApiKey).toBeUndefined();
        expect(config.rpcUrl).toBe('https://soroban-testnet.stellar.org');
    });

    it('falls back to built-in defaults for pubnet', async () => {
        const { getNetworkConfig } = await import('$lib/server/config/network');
        const config = getNetworkConfig('stellar:pubnet');

        expect(config.facilitatorUrl).toBe('https://x402.org/facilitator');
        expect(config.facilitatorApiKey).toBeUndefined();
        expect(config.rpcUrl).toBeUndefined();
    });

    it('returns different configs for different networks', async () => {
        mockPrivateEnv.TESTNET_FACILITATOR_URL = 'https://testnet.example.com';
        mockPrivateEnv.TESTNET_FACILITATOR_API_KEY = 'testnet-key';
        mockPrivateEnv.PUBNET_FACILITATOR_URL = 'https://pubnet.example.com';
        mockPrivateEnv.PUBNET_FACILITATOR_API_KEY = 'pubnet-key';

        const { getNetworkConfig } = await import('$lib/server/config/network');
        const testnet = getNetworkConfig('stellar:testnet');
        const pubnet = getNetworkConfig('stellar:pubnet');

        expect(testnet.facilitatorUrl).not.toBe(pubnet.facilitatorUrl);
        expect(testnet.facilitatorApiKey).not.toBe(pubnet.facilitatorApiKey);
    });
});

describe('getRpcUrl', () => {
    beforeEach(() => {
        vi.resetModules();
        Object.keys(mockPrivateEnv).forEach((k) => delete mockPrivateEnv[k]);
        Object.keys(mockPublicEnv).forEach((k) => delete mockPublicEnv[k]);
    });

    it('returns per-network RPC URL when set', async () => {
        mockPublicEnv.PUBLIC_PUBNET_RPC_URL = 'https://pubnet-rpc.example.com';

        const { getRpcUrl } = await import('$lib/server/config/network');
        expect(getRpcUrl('stellar:pubnet')).toBe('https://pubnet-rpc.example.com');
    });

    it('falls back to generic RPC URL', async () => {
        mockPublicEnv.PUBLIC_STELLAR_RPC_URL = 'https://generic-rpc.example.com';

        const { getRpcUrl } = await import('$lib/server/config/network');
        expect(getRpcUrl('stellar:pubnet')).toBe('https://generic-rpc.example.com');
    });

    it('returns testnet default when nothing set', async () => {
        const { getRpcUrl } = await import('$lib/server/config/network');
        expect(getRpcUrl('stellar:testnet')).toBe('https://soroban-testnet.stellar.org');
    });

    it('returns undefined for pubnet when nothing set', async () => {
        const { getRpcUrl } = await import('$lib/server/config/network');
        expect(getRpcUrl('stellar:pubnet')).toBeUndefined();
    });
});
