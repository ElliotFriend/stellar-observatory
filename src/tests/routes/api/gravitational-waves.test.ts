import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
    env: { PUBLIC_STELLAR_NETWORK: 'stellar:testnet' },
}));

describe('GET /api/gravitational-waves', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
    });

    function makeCookies(network = 'stellar:testnet') {
        return { get: (name: string) => (name === 'stellar_network' ? network : undefined) };
    }

    it('returns dummy gravitational wave data on testnet', async () => {
        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:testnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('events');
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('observingRun');
        expect(data).toHaveProperty('timestamp');
        expect(data.events.length).toBe(data.count);
    });

    it('falls back to dummy on pubnet fetch failure', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);
        expect(response.headers.get('X-Data-Source')).toBe('fallback');
    });

    it('returns real data on pubnet when fetch succeeds', async () => {
        const mockGWOSCResponse = {
            events: {
                GW150914: {
                    GPS: '2015-09-14T09:50:45Z',
                    parameters: {
                        mass_1_source: 35.6,
                        mass_2_source: 30.6,
                        chirp_mass: 28.6,
                        network_matched_filter_snr: 24.4,
                        luminosity_distance: 440,
                        ra: '13h 09m',
                        dec: '-30° 05′',
                        sky_size: 600,
                    },
                    strain: { H1: {}, L1: {}, V1: {} },
                },
                GW170817: {
                    GPS: '2017-08-17T12:41:04Z',
                    parameters: {
                        mass_1_source: 1.46,
                        mass_2_source: 1.27,
                        chirp_mass: 1.186,
                        network_matched_filter_snr: 32.4,
                        luminosity_distance: 40,
                        ra: '13h 09m',
                        dec: '-23° 23′',
                        sky_size: 16,
                    },
                    strain: { H1: {}, L1: {} },
                },
            },
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockGWOSCResponse) }),
        );

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.events.length).toBe(2);
        expect(data.count).toBe(2);
        expect(data.observingRun).toBe('GWTC');

        // GW150914 - BBH
        expect(data.events[0].eventName).toBe('GW150914');
        expect(data.events[0].source).toBe('binary-black-hole');
        expect(data.events[0].chirpMass).toBe(28.6);
        expect(data.events[0].signalToNoise).toBe(24.4);
        expect(data.events[0].estimatedDistance).toBe(440);
        expect(data.events[0].detectors).toContain('LIGO-Hanford');
        expect(data.events[0].detectors).toContain('LIGO-Livingston');
        expect(data.events[0].detectors).toContain('Virgo');

        // GW170817 - BNS
        expect(data.events[1].eventName).toBe('GW170817');
        expect(data.events[1].source).toBe('binary-neutron-star');
    });

    it('classifies source types based on component masses', async () => {
        const mockResponse = {
            events: {
                BBH_Event: {
                    GPS: '2020-01-01T00:00:00Z',
                    parameters: { mass_1_source: 40, mass_2_source: 35, chirp_mass: 30, network_matched_filter_snr: 20, luminosity_distance: 500 },
                    strain: { H1: {}, L1: {} },
                },
                BNS_Event: {
                    GPS: '2020-02-01T00:00:00Z',
                    parameters: { mass_1_source: 1.5, mass_2_source: 1.3, chirp_mass: 1.2, network_matched_filter_snr: 15, luminosity_distance: 100 },
                    strain: { H1: {}, L1: {} },
                },
                NSBH_Event: {
                    GPS: '2020-03-01T00:00:00Z',
                    parameters: { mass_1_source: 8, mass_2_source: 1.5, chirp_mass: 3, network_matched_filter_snr: 12, luminosity_distance: 300 },
                    strain: { H1: {}, L1: {} },
                },
            },
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockResponse) }),
        );

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        const data = await response.json();

        expect(data.events[0].source).toBe('binary-black-hole');
        expect(data.events[1].source).toBe('binary-neutron-star');
        expect(data.events[2].source).toBe('neutron-star-black-hole');
    });

    it('computes confidence from SNR correctly', async () => {
        const mockResponse = {
            events: {
                HighSNR: {
                    GPS: '2020-01-01T00:00:00Z',
                    parameters: { mass_1_source: 30, mass_2_source: 30, chirp_mass: 26, network_matched_filter_snr: 25, luminosity_distance: 400 },
                    strain: { H1: {}, L1: {} },
                },
                LowSNR: {
                    GPS: '2020-02-01T00:00:00Z',
                    parameters: { mass_1_source: 30, mass_2_source: 30, chirp_mass: 26, network_matched_filter_snr: 8, luminosity_distance: 1200 },
                    strain: { H1: {}, L1: {} },
                },
            },
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve(mockResponse) }),
        );

        const { GET } = await import('../../../routes/api/gravitational-waves/+server.js');
        const response = await GET({ cookies: makeCookies('stellar:pubnet') } as Parameters<typeof GET>[0]);
        const data = await response.json();

        // Higher SNR => higher confidence
        expect(data.events[0].confidence).toBeGreaterThan(data.events[1].confidence);
        // All confidences in valid range
        for (const event of data.events) {
            expect(event.confidence).toBeGreaterThan(0);
            expect(event.confidence).toBeLessThanOrEqual(1);
        }
    });
});
