import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

function makeParams(overrides: Record<string, number>) {
    return Object.entries(overrides).map(([name, best]) => ({
        name,
        unit: '',
        description: 'na',
        best,
        upper_error: null,
        lower_error: null,
        is_upper_limit: false,
        is_lower_limit: false,
        decimal_places: 1,
    }));
}

function mockFetchWith(data: unknown) {
    return vi.fn().mockResolvedValueOnce({
        json: () => Promise.resolve(data),
    });
}

describe('GET /api/gravitational-waves', () => {
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
            Awaited<typeof import('../../../routes/api/gravitational-waves/+server.js')>['GET']
        >[0];
    }

    it('returns dummy gravitational wave data on testnet', async () => {
        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET(makeEvent('stellar:testnet'));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('events');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('observingRun');
        expect(data).toHaveProperty('timestamp');
        expect(data.events.length).toBe(data.count);
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'));

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', fetchFn));
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockGWOSCResponse = {
            results: [
                {
                    name: 'GW150914',
                    shortName: 'GW150914-v3',
                    gps: 1126259462.4,
                    version: 3,
                    catalog: 'GWTC-1-confident',
                    detectors: ['H1', 'L1', 'V1'],
                    default_parameters: makeParams({
                        mass_1_source: 35.6,
                        mass_2_source: 30.6,
                        chirp_mass_source: 28.6,
                        network_matched_filter_snr: 24.4,
                        luminosity_distance: 440,
                        p_astro: 0.99,
                    }),
                },
                {
                    name: 'GW170817',
                    shortName: 'GW170817-v3',
                    gps: 1187008882.4,
                    version: 3,
                    catalog: 'GWTC-1-confident',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 1.46,
                        mass_2_source: 1.27,
                        chirp_mass_source: 1.186,
                        network_matched_filter_snr: 32.4,
                        luminosity_distance: 40,
                        p_astro: 0.99,
                    }),
                },
            ],
        };

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockGWOSCResponse)));
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.events.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.observingRun).toBe('GWTC-1-confident');

        // GW150914 - BBH
        expect(data.events[0].id).toBe('GW150914');
        expect(data.events[0].eventName).toBe('GW150914-v3');
        expect(data.events[0].source).toBe('binary-black-hole');
        expect(data.events[0].chirpMass).toBe(28.6);
        expect(data.events[0].signalToNoise).toBe(24.4);
        expect(data.events[0].estimatedDistance).toBe(440);
        expect(data.events[0].detectors).toContain('LIGO-Hanford');
        expect(data.events[0].detectors).toContain('LIGO-Livingston');
        expect(data.events[0].detectors).toContain('Virgo');

        // GW170817 - BNS
        expect(data.events[1].id).toBe('GW170817');
        expect(data.events[1].eventName).toBe('GW170817-v3');
        expect(data.events[1].source).toBe('binary-neutron-star');
    });

    it('classifies source types based on component masses', async () => {
        const mockResponse = {
            results: [
                {
                    name: 'BBH_Event',
                    shortName: 'BBH_Event-v1',
                    gps: 1262304018,
                    version: 1,
                    catalog: 'GWTC',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 40,
                        mass_2_source: 35,
                        chirp_mass_source: 30,
                        network_matched_filter_snr: 20,
                        luminosity_distance: 500,
                    }),
                },
                {
                    name: 'BNS_Event',
                    shortName: 'BNS_Event-v1',
                    gps: 1264982418,
                    version: 1,
                    catalog: 'GWTC',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 1.5,
                        mass_2_source: 1.3,
                        chirp_mass_source: 1.2,
                        network_matched_filter_snr: 15,
                        luminosity_distance: 100,
                    }),
                },
                {
                    name: 'NSBH_Event',
                    shortName: 'NSBH_Event-v1',
                    gps: 1267401618,
                    version: 1,
                    catalog: 'GWTC',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 8,
                        mass_2_source: 1.5,
                        chirp_mass_source: 3,
                        network_matched_filter_snr: 12,
                        luminosity_distance: 300,
                    }),
                },
            ],
        };

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockResponse)));
        const data = await response.json();

        expect(data.events[0].source).toBe('binary-black-hole');
        expect(data.events[1].source).toBe('binary-neutron-star');
        expect(data.events[2].source).toBe('neutron-star-black-hole');
    });

    it('computes confidence from p_astro or SNR', async () => {
        const mockResponse = {
            results: [
                {
                    name: 'WithPAstro',
                    shortName: 'WithPAstro-v1',
                    gps: 1262304018,
                    version: 1,
                    catalog: 'GWTC',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 30,
                        mass_2_source: 30,
                        chirp_mass_source: 26,
                        network_matched_filter_snr: 25,
                        luminosity_distance: 400,
                        p_astro: 0.97,
                    }),
                },
                {
                    name: 'NoPAstro',
                    shortName: 'NoPAstro-v1',
                    gps: 1264982418,
                    version: 1,
                    catalog: 'GWTC',
                    detectors: ['H1', 'L1'],
                    default_parameters: makeParams({
                        mass_1_source: 30,
                        mass_2_source: 30,
                        chirp_mass_source: 26,
                        network_matched_filter_snr: 8,
                        luminosity_distance: 1200,
                    }),
                },
            ],
        };

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET(makeEvent('stellar:pubnet', mockFetchWith(mockResponse)));
        const data = await response.json();

        // First event uses p_astro directly
        expect(data.events[0].confidence).toBe(0.97);
        // Second event falls back to SNR/30
        expect(data.events[1].confidence).toBeCloseTo(8 / 30, 4);
        // All confidences in valid range
        for (const event of data.events) {
            expect(event.confidence).toBeGreaterThan(0);
            expect(event.confidence).toBeLessThanOrEqual(1);
        }
    });
});
