import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('POST /api/network', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    function makeRequest(body: unknown) {
        return {
            json: () => Promise.resolve(body),
        } as unknown as Request;
    }

    function makeCookies() {
        const store: Record<string, string> = {};
        return {
            get: (name: string) => store[name],
            set: (name: string, value: string, opts?: Record<string, unknown>) => {
                store[name] = value;
            },
            _store: store,
        };
    }

    it('sets cookie to stellar:testnet', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({ network: 'stellar:testnet' }),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.network).toBe('stellar:testnet');
        expect(cookies._store['stellar_network']).toBe('stellar:testnet');
    });

    it('sets cookie to stellar:pubnet', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({ network: 'stellar:pubnet' }),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.network).toBe('stellar:pubnet');
        expect(cookies._store['stellar_network']).toBe('stellar:pubnet');
    });

    it('rejects invalid network value', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({ network: 'invalid:network' }),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBeTruthy();
    });

    it('rejects missing network value', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({}),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(400);
    });

    it('rejects null network value', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({ network: null }),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(400);
    });

    it('rejects stellar:mainnet (not a valid network)', async () => {
        const { POST } = await import('../../../routes/api/network/+server.js');
        const cookies = makeCookies();
        const response = await POST({
            request: makeRequest({ network: 'stellar:mainnet' }),
            cookies,
        } as unknown as Parameters<typeof POST>[0]);

        expect(response.status).toBe(400);
    });
});
