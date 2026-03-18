import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('GET /api/deep-sky-catalog', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    function makeCookies(network = 'stellar:testnet') {
        return { get: (name: string) => (name === 'stellar_network' ? network : undefined) };
    }

    it('returns dummy deep sky data on testnet', async () => {
        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:testnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('objects');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('timestamp');
        expect(data.objects.length).toBe(data.count);
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockDatastroResponse = {
            results: [
                {
                    name1: 'Andromeda Galaxy',
                    name2: 'M31',
                    type: 'Galaxy',
                    constellation: 'Andromeda',
                    ra: 10.6847,
                    dec: 41.2687,
                    mag: 3.44,
                    distance_ly: 2537000,
                },
                {
                    name1: 'Orion Nebula',
                    name2: 'M42',
                    type: 'Nebula',
                    constellation: 'Orion',
                    ra: 83.8221,
                    dec: -5.3911,
                    mag: 4.0,
                    distance_ly: 1344,
                },
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockDatastroResponse) }),
        );

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.objects.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.objects[0].name).toBe('Andromeda Galaxy');
        expect(data.objects[0].type).toBe('galaxy');
        expect(data.objects[0].constellation).toBe('Andromeda');
        expect(data.objects[0].apparentMagnitude).toBe(3.44);
        expect(data.objects[1].name).toBe('Orion Nebula');
        expect(data.objects[1].type).toBe('nebula');
    });

    it('maps object types correctly', async () => {
        const mockResponse = {
            results: [
                { name1: 'Cluster1', type: 'Open Cluster', constellation: 'Taurus', ra: 0, dec: 0, mag: 5, distance_ly: 100 },
                { name1: 'Cluster2', type: 'Globular Cluster', constellation: 'Sagittarius', ra: 0, dec: 0, mag: 6, distance_ly: 200 },
                { name1: 'Remnant1', type: 'Supernova Remnant', constellation: 'Taurus', ra: 0, dec: 0, mag: 8, distance_ly: 6500 },
                { name1: 'PNebula', type: 'Planetary Nebula', constellation: 'Lyra', ra: 0, dec: 0, mag: 9, distance_ly: 2000 },
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockResponse) }),
        );

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        const data = await response.json();

        expect(data.objects[0].type).toBe('cluster');
        expect(data.objects[1].type).toBe('cluster');
        expect(data.objects[2].type).toBe('supernova-remnant');
        expect(data.objects[3].type).toBe('nebula');
    });

    it('assigns appropriate imaging recommendations based on type', async () => {
        const mockResponse = {
            results: [
                { name1: 'Galaxy1', type: 'Galaxy', constellation: 'Andromeda', ra: 0, dec: 0, mag: 5, distance_ly: 100000 },
                { name1: 'Nebula1', type: 'Nebula', constellation: 'Orion', ra: 0, dec: 0, mag: 4, distance_ly: 1000 },
                { name1: 'Cluster1', type: 'Open Cluster', constellation: 'Taurus', ra: 0, dec: 0, mag: 3, distance_ly: 500 },
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockResponse) }),
        );

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        const data = await response.json();

        // Galaxy should need large aperture
        expect(data.objects[0].imagingRecommendation.minAperture).toBe(200);
        expect(data.objects[0].imagingRecommendation.filterSuggestion).toContain('RGB');

        // Nebula should suggest narrowband
        expect(data.objects[1].imagingRecommendation.filterSuggestion).toContain('narrowband');

        // Cluster should have small aperture
        expect(data.objects[2].imagingRecommendation.minAperture).toBe(50);
    });

    it('formats RA and Dec from numeric values', async () => {
        const mockResponse = {
            results: [
                {
                    name1: 'Test Object',
                    type: 'Galaxy',
                    constellation: 'Test',
                    ra: 180.0, // 12h 00m
                    dec: -45.5, // -45° 30'
                    mag: 8,
                    distance_ly: 1000,
                },
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockResponse) }),
        );

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        const data = await response.json();

        expect(data.objects[0].rightAscension).toMatch(/12h 00m/);
        expect(data.objects[0].declination).toMatch(/-45°/);
    });
});
