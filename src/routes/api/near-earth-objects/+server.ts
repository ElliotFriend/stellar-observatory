import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyNearEarthObjectsData } from '$lib/data/near-earth-objects';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { NearEarthObjectsData, NearEarthObject } from '$lib/types/api';

function calculateDiameters(
    diameterKm: string | null,
    diameterSigma: string | null,
    hMag: number,
): { min: number; best: number; max: number } {
    const best =
        diameterKm !== null
            ? Math.round(parseFloat(diameterKm) * 1000)
            : Math.round(((1329 / Math.sqrt(0.15)) * Math.pow(10, -hMag / 5)) * 1000);

    if (diameterSigma !== null) {
        const sigmaM = parseFloat(diameterSigma) * 1000;
        return { min: Math.round(best - sigmaM), best, max: Math.round(best + sigmaM) };
    }

    return { min: Math.round(best * 0.7), best, max: Math.round(best * 1.4) };
}

const futureDays = 60;
const nasaParams = new URLSearchParams({
    'date-min': 'now',
    'date-max': `+${futureDays}`,
    'dist-max': '0.05',
    sort: 'dist',
    limit: '50',
    diameter: 'true',
});
const nasaUrl = `https://ssd-api.jpl.nasa.gov/cad.api?${nasaParams.toString()}`;

export const GET: RequestHandler = async ({ cookies, fetch }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyNearEarthObjectsData());
    }

    try {
        const res = await fetch(nasaUrl);
        const raw = await res.json();

        // CAD API returns { fields: [...], data: [[...], ...] }
        const fields: string[] = raw.fields;
        const idx = (name: string) => fields.indexOf(name);

        const objects: NearEarthObject[] = (raw.data as string[][]).map((row: string[]) => {
            const distAU = parseFloat(row[idx('dist')]);
            const distKm = distAU * 149597870.7;
            const vRel = parseFloat(row[idx('v_rel')]);
            const hMag = parseFloat(row[idx('h')]) || 22;

            const diameters = calculateDiameters(
                row[idx('diameter')],
                row[idx('diameter_sigma')],
                hMag,
            );

            return {
                name: row[idx('des')],
                estimatedDiameter: diameters,
                isHazardous: diameters.best > 140,
                closeApproachDate: row[idx('cd')],
                missDistance: { astronomical: distAU, kilometers: Math.round(distKm) },
                relativeVelocity: Math.round(vRel * 100) / 100,
                orbitClass: row[idx('orbit_id')] ? 'Apollo' : 'Unknown',
            };
        });

        const now = new Date();
        const future = new Date(now.getTime() + futureDays * 24 * 60 * 60 * 1000);

        return json({
            objects,
            count: objects.length,
            queryPeriod: {
                start: now.toISOString().split('T')[0],
                end: future.toISOString().split('T')[0],
            },
            timestamp: new Date().toISOString(),
        } satisfies NearEarthObjectsData);
    } catch (err) {
        console.error('Failed to fetch near-earth objects:', err);
        return json(getDummyNearEarthObjectsData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
