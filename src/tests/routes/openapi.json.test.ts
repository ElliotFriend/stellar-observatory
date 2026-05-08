import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
    env: { PAYTO_ADDRESS: 'GA__TEST' },
}));

describe('GET /openapi.json', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('returns a 3.1 OpenAPI document keyed off the request origin', async () => {
        const mod = await import('../../routes/openapi.json/+server');
        const event = {
            url: new URL('https://example.test/openapi.json'),
        } as unknown as Parameters<typeof mod.GET>[0];

        const res = await mod.GET(event);
        expect(res).toBeInstanceOf(Response);
        expect(res.status).toBe(200);

        const body = (await res.json()) as Record<string, unknown>;
        expect(body.openapi).toBe('3.1.0');
        expect(body.servers).toEqual([{ url: 'https://example.test' }]);
        const xs = body['x-service-info'] as Record<string, unknown>;
        expect(xs.payTo).toBe('GA__TEST');
    });
});
