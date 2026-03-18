import { describe, it, expect } from 'vitest';
import { endpoints, getEndpointBySlug } from '$lib/config/endpoints';

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
});
