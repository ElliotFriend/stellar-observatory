import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

function mockFetchWith(data: unknown) {
    return vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(data),
    });
}

describe('GET /api/deep-sky-catalog', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    function makeCookies(network = 'stellar:testnet') {
        return { get: (name: string) => (name === 'stellar_network' ? network : undefined) };
    }

    function makeEvent(network: string, fetchFn?: ReturnType<typeof vi.fn>) {
        return {
            cookies: makeCookies(network),
            fetch: fetchFn,
        } as unknown as Parameters<
            Awaited<typeof import('../../../routes/api/deep-sky-catalog/+server.js')>['GET']
        >[0];
    }

    it('returns dummy deep sky data on testnet', async () => {
        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(makeEvent('stellar:testnet'));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('objects');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('timestamp');
        expect(data.objects.length).toBe(data.count);
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', fetchFn));
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockDatastroResponse = {
            results: [
                {
                    id: 'DSO-001',
                    name: 'Andromeda Galaxy',
                    type: 'Gxy',
                    const: 'Andromeda',
                    ra: 10.6847,
                    dec: 41.2687,
                    mag: 3.44,
                    cat1: 'M',
                    id1: '31',
                },
                {
                    id: 'DSO-002',
                    name: 'Orion Nebula',
                    type: 'Neb',
                    const: 'Orion',
                    ra: 83.8221,
                    dec: -5.3911,
                    mag: 4.0,
                    cat1: 'M',
                    id1: '42',
                },
            ],
        };

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(
            makeEvent('stellar:pubnet', mockFetchWith(mockDatastroResponse)),
        );
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.objects.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.objects[0].name).toBe('Andromeda Galaxy');
        expect(data.objects[0].type).toBe('galaxy');
        expect(data.objects[0].constellation).toBe('Andromeda');
        expect(data.objects[0].apparentMagnitude).toBe(3.44);
        expect(data.objects[0].catalogDesignation).toBe('M 31');
        expect(data.objects[1].name).toBe('Orion Nebula');
        expect(data.objects[1].type).toBe('nebula');
    });

    it('maps object types correctly', async () => {
        const mockResponse = {
            results: [
                { name: 'Cluster1', type: 'OC', const: 'Taurus', ra: 0, dec: 0, mag: 5 },
                { name: 'Cluster2', type: 'GC', const: 'Sagittarius', ra: 0, dec: 0, mag: 6 },
                { name: 'Remnant1', type: 'SNR', const: 'Taurus', ra: 0, dec: 0, mag: 8 },
                { name: 'PNebula', type: 'PN', const: 'Lyra', ra: 0, dec: 0, mag: 9 },
            ],
        };

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockResponse)));
        const data = await response.json();

        expect(data.objects[0].type).toBe('cluster');
        expect(data.objects[1].type).toBe('cluster');
        expect(data.objects[2].type).toBe('supernova-remnant');
        expect(data.objects[3].type).toBe('nebula');
    });

    it('assigns appropriate imaging recommendations based on type', async () => {
        const mockResponse = {
            results: [
                { name: 'Galaxy1', type: 'Gxy', const: 'Andromeda', ra: 0, dec: 0, mag: 5 },
                { name: 'Nebula1', type: 'Neb', const: 'Orion', ra: 0, dec: 0, mag: 4 },
                { name: 'Cluster1', type: 'OC', const: 'Taurus', ra: 0, dec: 0, mag: 3 },
            ],
        };

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockResponse)));
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
                    name: 'Test Object',
                    type: 'Gxy',
                    const: 'Test',
                    ra: 180.0, // 12h 00m
                    dec: -45.5, // -45° 30'
                    mag: 8,
                },
            ],
        };

        const { GET } = await import('../../../routes/api/deep-sky-catalog/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockResponse)));
        const data = await response.json();

        expect(data.objects[0].rightAscension).toMatch(/12h 00m/);
        expect(data.objects[0].declination).toMatch(/-45°/);
    });
});
