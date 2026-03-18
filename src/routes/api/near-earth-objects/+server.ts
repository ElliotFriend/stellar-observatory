import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyNearEarthObjectsData } from '$lib/data/near-earth-objects';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { NearEarthObjectsData } from '$lib/types/api';

async function fetchRealNearEarthObjectsData(): Promise<NearEarthObjectsData> {
    const res = await fetch(
        'https://ssd-api.jpl.nasa.gov/cad.api?date-min=now&date-max=%2B30&sort=dist&limit=10',
    );
    const raw = await res.json();

    // CAD API returns { fields: [...], data: [[...], ...] }
    const fields: string[] = raw.fields;
    const idx = (name: string) => fields.indexOf(name);

    const objects = (raw.data as string[][]).map((row: string[], i: number) => {
        const distAU = parseFloat(row[idx('dist')]);
        const distKm = distAU * 149597870.7;
        const vRel = parseFloat(row[idx('v_rel')]);
        const hMag = parseFloat(row[idx('h')]) || 22;
        // Estimate diameter from absolute magnitude H
        const diameterKm = (1329 / Math.sqrt(0.15)) * Math.pow(10, -hMag / 5);
        const diameterM = diameterKm * 1000;

        return {
            id: `NEO-LIVE-${i}`,
            name: row[idx('des')] || `Unknown-${i}`,
            designation: row[idx('des')] || `Unknown-${i}`,
            estimatedDiameter: {
                min: Math.round(diameterM * 0.7),
                max: Math.round(diameterM * 1.4),
            },
            isHazardous: distAU < 0.05 && diameterM > 140,
            closeApproachDate: row[idx('cd')],
            missDistance: { astronomical: distAU, kilometers: Math.round(distKm) },
            relativeVelocity: Math.round(vRel * 100) / 100,
            orbitClass: row[idx('orbit_id')] ? 'Apollo' : 'Unknown',
        };
    });

    const now = new Date();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
        objects,
        count: objects.length,
        queryPeriod: {
            start: now.toISOString().split('T')[0],
            end: future.toISOString().split('T')[0],
        },
        timestamp: new Date().toISOString(),
    };
}

export const GET: RequestHandler = async ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyNearEarthObjectsData());
    }

    try {
        const data = await fetchRealNearEarthObjectsData();
        return json(data);
    } catch {
        return json(getDummyNearEarthObjectsData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
