import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyGravitationalWavesData } from '$lib/data/gravitational-waves';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { GravitationalWavesData, GravitationalWaveEvent } from '$lib/types/api';

const SOURCE_MAP: Record<string, GravitationalWaveEvent['source']> = {
    BBH: 'binary-black-hole',
    BNS: 'binary-neutron-star',
    NSBH: 'neutron-star-black-hole',
};

async function fetchRealGravitationalWavesData(): Promise<GravitationalWavesData> {
    const res = await fetch('https://gwosc.org/eventapi/json/GWTC/');
    const raw = await res.json();

    const eventEntries = Object.entries(raw.events || {}).slice(0, 20);

    const events: GravitationalWaveEvent[] = eventEntries.map(
        ([name, details]: [string, unknown], i: number) => {
            const d = details as Record<string, unknown>;
            const params = (d.parameters as Record<string, unknown>) || {};

            const snr = Number(params.network_matched_filter_snr) || Number(params.SNR) || 10;
            const chirpMass = Number(params.chirp_mass) || Number(params.chirp_mass_source) || 10;
            const distance = Number(params.luminosity_distance) || 500;
            const ra = (params.ra as string) || '12h 00m 00s';
            const dec = (params.dec as string) || '+00° 00′ 00″';

            const massRatio = Number(params.mass_ratio) || 0.5;
            const mass1 = Number(params.mass_1_source) || 30;
            const mass2 = Number(params.mass_2_source) || mass1 * massRatio;

            const cat = (d.catalog_shortname as string) || '';
            let source: GravitationalWaveEvent['source'];
            if (SOURCE_MAP[cat]) {
                source = SOURCE_MAP[cat];
            } else if (mass1 > 3 && mass2 > 3) {
                source = 'binary-black-hole';
            } else if (mass1 < 3 && mass2 < 3) {
                source = 'binary-neutron-star';
            } else if (mass1 > 3 || mass2 > 3) {
                source = 'neutron-star-black-hole';
            } else {
                source = 'unknown';
            }

            const detectors: string[] = [];
            const jsonDetectors = d.detectors as string[] | undefined;
            if (jsonDetectors) {
                detectors.push(...jsonDetectors);
            } else {
                if ((d.strain as Record<string, unknown>)?.['H1']) detectors.push('LIGO-Hanford');
                if ((d.strain as Record<string, unknown>)?.['L1'])
                    detectors.push('LIGO-Livingston');
                if ((d.strain as Record<string, unknown>)?.['V1']) detectors.push('Virgo');
                if (detectors.length === 0) detectors.push('LIGO-Hanford', 'LIGO-Livingston');
            }

            return {
                id: `GW-LIVE-${i}`,
                eventName: name,
                detectionTime:
                    (d.GPS as string) || (d.commonName as string) || new Date().toISOString(),
                source,
                estimatedDistance: Math.round(distance),
                signalToNoise: Math.round(snr * 10) / 10,
                chirpMass: Math.round(chirpMass * 100) / 100,
                skyLocalization: {
                    ra: typeof ra === 'number' ? `${Math.round(ra)}°` : String(ra),
                    dec: typeof dec === 'number' ? `${Math.round(dec)}°` : String(dec),
                    errorRadius: Number(params.sky_size) || 50,
                },
                detectors,
                confidence: Math.min(snr / 30, 0.9999),
            };
        },
    );

    return {
        events,
        count: events.length,
        observingRun: 'GWTC',
        timestamp: new Date().toISOString(),
    };
}

export const GET: RequestHandler = async ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyGravitationalWavesData());
    }

    try {
        const data = await fetchRealGravitationalWavesData();
        return json(data);
    } catch {
        return json(getDummyGravitationalWavesData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
