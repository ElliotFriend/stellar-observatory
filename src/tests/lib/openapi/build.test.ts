import { describe, it, expect } from 'vitest';
import { buildOpenApiDocument } from '$lib/openapi/build';
import { apiRoutes, endpoints } from '$lib/config/endpoints';

const opts = { baseUrl: 'https://example.invalid', payTo: 'GA__TEST' };

describe('buildOpenApiDocument', () => {
    const doc = buildOpenApiDocument(opts);

    it('emits OpenAPI 3.1', () => {
        expect(doc.openapi).toBe('3.1.0');
    });

    it('declares service info', () => {
        expect(doc.info.title).toBe('Stellar Observatory API');
        expect(doc.info.version).toBeTruthy();
    });

    it('lists configured server', () => {
        expect(doc.servers).toEqual([{ url: 'https://example.invalid' }]);
    });

    it('emits x-service-info root extension', () => {
        const xs = (doc as Record<string, unknown>)['x-service-info'] as Record<string, unknown>;
        expect(xs).toBeDefined();
        expect(xs.payTo).toBe('GA__TEST');
        expect(xs.networks).toEqual(['stellar:pubnet', 'stellar:testnet']);
    });

    it('includes every route from apiRoutes', () => {
        const paths = Object.keys(doc.paths ?? {}).sort();
        const expected = apiRoutes.map((r) => r.path).sort();
        expect(paths).toEqual(expected);
    });

    it('paid endpoints carry x-payment-info with the right amount', () => {
        for (const ep of endpoints) {
            const op = (doc.paths?.[ep.path] as Record<string, Record<string, unknown>>)[
                ep.method.toLowerCase()
            ];
            const xp = op['x-payment-info'] as { offers: Array<Record<string, string>> };
            expect(xp).toBeDefined();
            expect(xp.offers).toHaveLength(1);
            expect(xp.offers[0]).toMatchObject({
                intent: 'charge',
                method: 'x402',
                amount: ep.price,
                currency: 'USD',
            });
        }
    });

    it('paid endpoints declare a 402 with application/problem+json', () => {
        for (const ep of endpoints) {
            const op = (doc.paths?.[ep.path] as Record<string, Record<string, unknown>>)[
                ep.method.toLowerCase()
            ];
            const responses = op.responses as Record<string, Record<string, unknown>>;
            expect(responses['402']).toBeDefined();
            const content = responses['402'].content as Record<string, unknown>;
            expect(content['application/problem+json']).toBeDefined();
        }
    });

    it('unpaid /api/network has no x-payment-info and no 402', () => {
        const op = (doc.paths?.['/api/network'] as Record<string, Record<string, unknown>>).post;
        expect(op['x-payment-info']).toBeUndefined();
        const responses = op.responses as Record<string, unknown>;
        expect(responses['402']).toBeUndefined();
    });

    it('unpaid /api/network declares its request body', () => {
        const op = (doc.paths?.['/api/network'] as Record<string, Record<string, unknown>>).post;
        expect(op.requestBody).toBeDefined();
    });

    it('registers named component schemas', () => {
        const schemas = (doc.components?.schemas ?? {}) as Record<string, unknown>;
        expect(schemas.ExoplanetsData).toBeDefined();
        expect(schemas.SpaceWeatherData).toBeDefined();
        expect(schemas.NearEarthObjectsData).toBeDefined();
        expect(schemas.DeepSkyCatalogData).toBeDefined();
        expect(schemas.GravitationalWavesData).toBeDefined();
        expect(schemas.SetNetworkRequest).toBeDefined();
        expect(schemas.SetNetworkResponse).toBeDefined();
        expect(schemas.ErrorResponse).toBeDefined();
    });

    it('is deterministic across calls', () => {
        const a = JSON.stringify(buildOpenApiDocument(opts));
        const b = JSON.stringify(buildOpenApiDocument(opts));
        expect(a).toBe(b);
    });
});
