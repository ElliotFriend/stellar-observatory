import { describe, it, expect } from 'vitest';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { endpoints, apiRoutes, getEndpointBySlug } from '$lib/config/endpoints';

describe('endpoints config', () => {
    it('has 5 endpoints', () => {
        expect(endpoints).toHaveLength(5);
    });

    it('each endpoint has required fields', () => {
        for (const ep of endpoints) {
            expect(ep.slug).toBeTruthy();
            expect(ep.path).toMatch(/^\/api\//);
            expect(ep.price).toMatch(/^\$\d+(\.\d+)?$/);
            expect(ep.description).toBeTruthy();
            expect(ep.previewDescription).toBeTruthy();
            expect(ep.icon).toBeTruthy();
        }
    });

    it('slugs are unique', () => {
        const slugs = endpoints.map((ep) => ep.slug);
        expect(new Set(slugs).size).toBe(slugs.length);
    });

    it('paths match slugs', () => {
        for (const ep of endpoints) {
            expect(ep.path).toBe(`/api/${ep.slug}`);
        }
    });

    it('getEndpointBySlug returns correct endpoint', () => {
        const result = getEndpointBySlug('exoplanets');
        expect(result).toBeDefined();
        expect(result!.slug).toBe('exoplanets');
        expect(result!.price).toBe('$0.005');
    });

    it('getEndpointBySlug returns undefined for unknown slug', () => {
        expect(getEndpointBySlug('nonexistent')).toBeUndefined();
    });

    it('prices are in ascending order', () => {
        const prices = endpoints.map((ep) => parseFloat(ep.price.replace('$', '')));
        for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
    });

    it('every endpoint has a method and responseSchema', () => {
        for (const ep of endpoints) {
            expect(ep.method).toBe('GET');
            expect(ep.responseSchema).toBeDefined();
        }
    });
});

function listApiServerRoutes(): string[] {
    const apiDir = join(process.cwd(), 'src/routes/api');
    const out: string[] = [];
    for (const name of readdirSync(apiDir)) {
        const full = join(apiDir, name);
        if (!statSync(full).isDirectory()) continue;
        if (existsSync(join(full, '+server.ts'))) out.push(`/api/${name}`);
    }
    return out.sort();
}

describe('apiRoutes ↔ filesystem parity', () => {
    const fsRoutes = listApiServerRoutes();

    it('every +server.ts has an apiRoutes entry', () => {
        const registered = new Set(apiRoutes.map((r) => r.path));
        for (const path of fsRoutes) {
            expect(registered.has(path), `missing apiRoutes entry for ${path}`).toBe(true);
        }
    });

    it('every apiRoutes entry has a corresponding +server.ts', () => {
        const onDisk = new Set(fsRoutes);
        for (const route of apiRoutes) {
            expect(onDisk.has(route.path), `no +server.ts for ${route.path}`).toBe(true);
        }
    });

    it('apiRoutes count matches filesystem count', () => {
        expect(apiRoutes).toHaveLength(fsRoutes.length);
    });

    it('apiRoutes includes the unpaid /api/network entry', () => {
        const network = apiRoutes.find((r) => r.path === '/api/network');
        expect(network).toBeDefined();
        expect(network!.method).toBe('POST');
        expect(network!.price).toBeUndefined();
        expect(network!.requestSchema).toBeDefined();
    });
});
