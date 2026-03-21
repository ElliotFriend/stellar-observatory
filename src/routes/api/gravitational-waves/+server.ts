import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyGravitationalWavesData } from '$lib/data/gravitational-waves';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { GravitationalWavesData, GravitationalWaveEvent } from '$lib/types/api';

const GPS_EPOCH_MS = Date.UTC(1980, 0, 6, 0, 0, 0, 0);
const GPS_LEAP_SECONDS = 18;

function gpsToIso(gpsSeconds: number): string {
    const ms = GPS_EPOCH_MS + gpsSeconds * 1000 - GPS_LEAP_SECONDS * 1000;
    return new Date(ms).toISOString();
}

interface GwoscParameter {
    name: string;
    best: number | null;
}

interface GwoscEventVersion {
    name: string;
    shortName: string;
    gps: number;
    version: number;
    catalog: string;
    detectors: string[];
    default_parameters: GwoscParameter[];
}

function getParam(params: GwoscParameter[], name: string): number | null {
    return params.find((param) => param.name === name)?.best ?? null;
}

const DETECTOR_NAMES: Record<string, string> = {
    H1: 'LIGO-Hanford',
    L1: 'LIGO-Livingston',
    V1: 'Virgo',
    K1: 'KAGRA',
};

function classifySource(
    mass1: number | null,
    mass2: number | null,
): GravitationalWaveEvent['source'] {
    if (mass1 === null || mass2 === null) return 'unknown';
    const bothHeavy = mass1 > 3 && mass2 > 3;
    const bothLight = mass1 < 3 && mass2 < 3;
    if (bothHeavy) return 'binary-black-hole';
    if (bothLight) return 'binary-neutron-star';
    return 'neutron-star-black-hole';
}

const params = new URLSearchParams({
    'include-default-parameters': 'true',
    format: 'json',
    pagesize: '20',
});
const gwoscUrl = `https://gwosc.org/api/v2/event-versions?${params.toString()}`;

export const GET: RequestHandler = async ({ cookies, fetch }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyGravitationalWavesData());
    }

    try {
        const res = await fetch(gwoscUrl);
        const raw = await res.json();
        const results = raw.results as GwoscEventVersion[];

        const events: GravitationalWaveEvent[] = results.map((record) => {
            const p = record.default_parameters;

            const snr = getParam(p, 'network_matched_filter_snr');
            const chirpMass = getParam(p, 'chirp_mass_source');
            const distance = getParam(p, 'luminosity_distance');
            const mass1 = getParam(p, 'mass_1_source');
            const mass2 = getParam(p, 'mass_2_source');
            const pAstro = getParam(p, 'p_astro');

            return {
                id: record.name,
                eventName: record.shortName,
                detectionTime: gpsToIso(record.gps),
                source: classifySource(mass1, mass2),
                estimatedDistance: distance !== null ? Math.round(distance) : 0,
                signalToNoise: snr !== null ? Math.round(snr * 10) / 10 : 0,
                chirpMass: chirpMass !== null ? Math.round(chirpMass * 100) / 100 : 0,
                detectors: record.detectors.map((d) => DETECTOR_NAMES[d] ?? d),
                confidence:
                    pAstro !== null ? pAstro : snr !== null ? Math.min(snr / 30, 0.9999) : 0,
            };
        });

        return json({
            events,
            count: events.length,
            observingRun: results[0]?.catalog ?? 'GWTC',
            timestamp: new Date().toISOString(),
        } satisfies GravitationalWavesData);
    } catch (err) {
        console.error('Failed to fetch gravitational wave events:', err);
        return json(getDummyGravitationalWavesData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
