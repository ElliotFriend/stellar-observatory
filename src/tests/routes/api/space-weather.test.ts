import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('GET /api/space-weather', () => {
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
            Awaited<typeof import('../../../routes/api/space-weather/+server.js')>['GET']
        >[0];
    }

    it('returns dummy space weather data on testnet', async () => {
        const { GET } = await import('../../../routes/api/space-weather/+server.js');
        const response = await GET(makeEvent('stellar:testnet'));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('solarWind');
        expect(data).toHaveProperty('geomagneticStorms');
        expect(data).toHaveProperty('solarFlares');
        expect(data).toHaveProperty('auroraForecast');
        expect(data).toHaveProperty('timestamp');
    });

    it('returns dummy data when no cookie is set (defaults to testnet)', async () => {
        const { GET } = await import('../../../routes/api/space-weather/+server.js');
        const response = await GET({
            cookies: { get: () => undefined },
        } as unknown as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('solarWind');
        expect(data.solarWind.speed).toBe(423.7); // dummy data value
    });

    it('attempts real data on pubnet and falls back to dummy on fetch failure', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

        const { GET } = await import('../../../routes/api/space-weather/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', fetchFn));
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');

        const data = await response.json();
        expect(data).toHaveProperty('solarWind');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockWindData = [
            ['time_tag', 'density', 'speed', 'temperature'],
            ['2025-03-15 12:00:00', '5.0', '450.0', '120000'],
        ];
        const mockMagData = [
            ['time_tag', 'bx_gsm', 'by_gsm', 'bz_gsm'],
            ['2025-03-15 12:00:00', '1.0', '2.0', '-3.0'],
        ];
        const mockKpData = [
            ['time_tag', 'Kp'],
            ['2025-03-15 12:00:00', '3'],
        ];
        const mockFlareData: unknown[] = [];

        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockWindData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockMagData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockKpData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockFlareData) });

        const { GET } = await import('../../../routes/api/space-weather/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', fetchFn));
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBeNull();

        const data = await response.json();
        expect(data.solarWind.speed).toBe(450.0);
        expect(data.solarWind.density).toBe(5.0);
        expect(data.solarWind.magneticField.bx).toBe(1.0);
        expect(data.solarWind.magneticField.by).toBe(2.0);
        expect(data.solarWind.magneticField.bz).toBe(-3.0);
        expect(data.timestamp).toBeTruthy();
    });

    it('validates space weather response structure from real API', async () => {
        const mockWindData = [
            ['time_tag', 'density', 'speed', 'temperature'],
            ['2025-03-15 12:00:00', '6.2', '500', '150000'],
        ];
        const mockMagData = [
            ['time_tag', 'bx_gsm', 'by_gsm', 'bz_gsm'],
            ['2025-03-15 12:00:00', '-1.5', '3.2', '-2.8'],
        ];
        const mockKpData = [
            ['time_tag', 'Kp'],
            ['2025-03-15 06:00:00', '5'],
            ['2025-03-15 12:00:00', '6'],
        ];
        const mockFlareData = [
            {
                satellite: 16,
                max_class: 'M2.5',
                begin_class: 'C1.0',
                end_class: 'B5.0',
                max_time: '2025-03-15T10:30:00Z',
                begin_time: '2025-03-15T10:00:00Z',
                end_time: '2025-03-15T10:45:00Z',
            },
        ];

        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockWindData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockMagData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockKpData) })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockFlareData) });

        const { GET } = await import('../../../routes/api/space-weather/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', fetchFn));
        const data = await response.json();

        // Verify geomagnetic storms are present (Kp >= 4)
        expect(data.geomagneticStorms.length).toBe(2);
        expect(data.geomagneticStorms[0].kpIndex).toBe(5);
        expect(data.geomagneticStorms[0].severity).toBe('moderate');
        expect(data.geomagneticStorms[1].kpIndex).toBe(6);
        expect(data.geomagneticStorms[1].severity).toBe('strong');

        // Verify solar flares
        expect(data.solarFlares.length).toBe(1);
        expect(data.solarFlares[0].class).toBe('M2.5');
        expect(data.solarFlares[0].sourceSatellite).toBe(16);

        // Verify aurora forecast probabilities are valid
        for (const entry of data.auroraForecast.northernHemisphere) {
            expect(entry.probability).toBeGreaterThanOrEqual(0);
            expect(entry.probability).toBeLessThanOrEqual(1);
        }
        for (const entry of data.auroraForecast.southernHemisphere) {
            expect(entry.probability).toBeGreaterThanOrEqual(0);
            expect(entry.probability).toBeLessThanOrEqual(1);
        }
    });
});
