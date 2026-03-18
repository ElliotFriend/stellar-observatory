import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('GET /api/near-earth-objects', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    function makeCookies(network = 'stellar:testnet') {
        return { get: (name: string) => (name === 'stellar_network' ? network : undefined) };
    }

    it('returns dummy NEO data on testnet', async () => {
        const { GET } = await import('../../../routes/api/near-earth-objects/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:testnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('objects');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('queryPeriod');
        expect(data).toHaveProperty('timestamp');
        expect(data.objects.length).toBe(data.count);
    });

    it('returns dummy data when no cookie is set', async () => {
        const { GET } = await import('../../../routes/api/near-earth-objects/+server.js');
        const response = await GET({ cookies: { get: () => undefined } } as unknown as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.objects[0].name).toBe('2025 AX7'); // dummy data value
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        const { GET } = await import('../../../routes/api/near-earth-objects/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockCADResponse = {
            fields: [
                'des',
                'orbit_id',
                'jd',
                'cd',
                'dist',
                'dist_min',
                'dist_max',
                'v_rel',
                'v_inf',
                'h',
            ],
            data: [
                [
                    '2025 AB1',
                    '45',
                    '2460500.5',
                    '2025-Apr-01 12:00',
                    '0.025',
                    '0.020',
                    '0.030',
                    '15.5',
                    '14.2',
                    '22.5',
                ],
                [
                    '2025 CD2',
                    '12',
                    '2460510.5',
                    '2025-Apr-11 06:00',
                    '0.055',
                    '0.050',
                    '0.060',
                    '20.3',
                    '19.1',
                    '19.8',
                ],
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockCADResponse) }),
        );

        const { GET } = await import('../../../routes/api/near-earth-objects/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBeNull();

        const data = await response.json();
        expect(data.objects.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.objects[0].name).toBe('2025 AB1');
        expect(data.objects[0].missDistance.astronomical).toBe(0.025);
        expect(data.objects[0].relativeVelocity).toBe(15.5);
        expect(data.objects[1].name).toBe('2025 CD2');
        expect(data.queryPeriod.start).toBeTruthy();
        expect(data.queryPeriod.end).toBeTruthy();
        expect(data.timestamp).toBeTruthy();
    });

    it('correctly determines hazardous status', async () => {
        const mockCADResponse = {
            fields: [
                'des',
                'orbit_id',
                'jd',
                'cd',
                'dist',
                'dist_min',
                'dist_max',
                'v_rel',
                'v_inf',
                'h',
            ],
            data: [
                // Close and large (H=18 => large diameter) => hazardous
                [
                    '2025 HZ1',
                    '10',
                    '2460500.5',
                    '2025-Apr-01 12:00',
                    '0.03',
                    '0.025',
                    '0.035',
                    '22.0',
                    '21.0',
                    '18.0',
                ],
                // Far away => not hazardous
                [
                    '2025 HZ2',
                    '20',
                    '2460510.5',
                    '2025-Apr-11 06:00',
                    '0.1',
                    '0.09',
                    '0.11',
                    '10.0',
                    '9.0',
                    '25.0',
                ],
            ],
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockCADResponse) }),
        );

        const { GET } = await import('../../../routes/api/near-earth-objects/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<
            typeof GET
        >[0]);
        const data = await response.json();

        expect(data.objects[0].isHazardous).toBe(true);
        expect(data.objects[1].isHazardous).toBe(false);
    });
});
