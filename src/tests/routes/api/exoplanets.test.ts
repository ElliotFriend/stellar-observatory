import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('GET /api/exoplanets', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    function makeCookies(network = 'stellar:testnet') {
        return { get: (name: string) => (name === 'stellar_network' ? network : undefined) };
    }

    it('returns dummy exoplanet data on testnet', async () => {
        const { GET } = await import('../../../routes/api/exoplanets/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:testnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('planets');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('timestamp');
        expect(data.planets.length).toBe(data.count);
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        const { GET } = await import('../../../routes/api/exoplanets/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockTAPResponse = [
            {
                pl_name: 'Kepler-22b',
                hostname: 'Kepler-22',
                sy_dist: 190,
                pl_orbper: 289.9,
                pl_bmasse: 36.0,
                pl_rade: 2.38,
                pl_eqt: 262,
                discoverymethod: 'Transit',
                disc_year: 2011,
            },
            {
                pl_name: 'TRAPPIST-1e',
                hostname: 'TRAPPIST-1',
                sy_dist: 12.14,
                pl_orbper: 6.1,
                pl_bmasse: 0.692,
                pl_rade: 0.92,
                pl_eqt: 251,
                discoverymethod: 'Transit',
                disc_year: 2017,
            },
        ];

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockTAPResponse) }),
        );

        const { GET } = await import('../../../routes/api/exoplanets/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.planets.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.planets[0].name).toBe('Kepler-22b');
        expect(data.planets[0].hostStar).toBe('Kepler-22');
        expect(data.planets[0].discoveryYear).toBe(2011);
        expect(data.planets[1].name).toBe('TRAPPIST-1e');
        expect(data.timestamp).toBeTruthy();
    });

    it('computes habitability scores correctly', async () => {
        const mockTAPResponse = [
            {
                // Ideal: temp 250K, radius 1.0, mass 1.0 => high score
                pl_name: 'Goldilocks',
                hostname: 'Sun-like',
                sy_dist: 50,
                pl_orbper: 365,
                pl_bmasse: 1.0,
                pl_rade: 1.0,
                pl_eqt: 250,
                discoverymethod: 'Transit',
                disc_year: 2024,
            },
            {
                // Bad: temp 1500K, radius 15, mass 500 => low score
                pl_name: 'Hot Jupiter',
                hostname: 'Giant-Star',
                sy_dist: 200,
                pl_orbper: 3.5,
                pl_bmasse: 500,
                pl_rade: 15,
                pl_eqt: 1500,
                discoverymethod: 'Transit',
                disc_year: 2020,
            },
        ];

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockTAPResponse) }),
        );

        const { GET } = await import('../../../routes/api/exoplanets/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        const data = await response.json();

        // Goldilocks should have high habitability
        expect(data.planets[0].habitabilityScore).toBeGreaterThan(0.5);
        // Hot Jupiter should have low habitability
        expect(data.planets[1].habitabilityScore).toBeLessThan(0.3);
        // All scores should be 0-1
        for (const planet of data.planets) {
            expect(planet.habitabilityScore).toBeGreaterThanOrEqual(0);
            expect(planet.habitabilityScore).toBeLessThanOrEqual(1);
        }
    });

    it('converts parsecs to light-years correctly', async () => {
        const mockTAPResponse = [
            {
                pl_name: 'Test-Planet',
                hostname: 'Test-Star',
                sy_dist: 100, // 100 parsecs
                pl_orbper: 10,
                pl_bmasse: 1,
                pl_rade: 1,
                pl_eqt: 250,
                discoverymethod: 'Transit',
                disc_year: 2024,
            },
        ];

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockTAPResponse) }),
        );

        const { GET } = await import('../../../routes/api/exoplanets/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        const data = await response.json();

        // 100 pc * 3.26156 = ~326.2 ly
        expect(data.planets[0].distanceLightYears).toBeCloseTo(326.2, 0);
    });
});
