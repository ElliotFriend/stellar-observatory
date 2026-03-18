import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyExoplanetsData } from '$lib/data/exoplanets';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { ExoplanetsData } from '$lib/types/api';

async function fetchRealExoplanetsData(): Promise<ExoplanetsData> {
    const query = encodeURIComponent(
        'SELECT TOP 20 pl_name,hostname,sy_dist,pl_orbper,pl_bmasse,pl_rade,pl_eqt,discoverymethod,disc_year FROM ps WHERE pl_bmasse IS NOT NULL AND pl_rade IS NOT NULL AND pl_eqt IS NOT NULL ORDER BY pl_eqt ASC',
    );
    const res = await fetch(
        `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${query}&format=json`,
    );
    const raw: Record<string, unknown>[] = await res.json();

    const planets = raw.map((row, i) => {
        const eqTemp = Number(row.pl_eqt) || 300;
        const radius = Number(row.pl_rade) || 1;
        const mass = Number(row.pl_bmasse) || 1;

        // Simple habitability heuristic: temperature near 200-310K, radius 0.5-2.5, mass <10
        let score = 0;
        if (eqTemp >= 200 && eqTemp <= 310) score += 0.4;
        else if (eqTemp >= 150 && eqTemp <= 350) score += 0.2;
        if (radius >= 0.5 && radius <= 2.5) score += 0.3;
        else if (radius >= 0.3 && radius <= 4) score += 0.15;
        if (mass < 10) score += 0.2;
        else if (mass < 20) score += 0.1;
        score = Math.round(Math.min(score, 1) * 100) / 100;

        // Convert parsecs to light-years (1 pc = 3.26156 ly)
        const distLY = Math.round((Number(row.sy_dist) || 100) * 3.26156 * 10) / 10;

        return {
            id: `EXO-LIVE-${i}`,
            name: (row.pl_name as string) || `Exoplanet-${i}`,
            hostStar: (row.hostname as string) || 'Unknown',
            distanceLightYears: distLY,
            orbitalPeriod: Math.round((Number(row.pl_orbper) || 0) * 10) / 10,
            mass: Math.round(mass * 100) / 100,
            radius: Math.round(radius * 100) / 100,
            equilibriumTemp: Math.round(eqTemp),
            discoveryMethod: (row.discoverymethod as string) || 'Unknown',
            discoveryYear: Number(row.disc_year) || 2020,
            habitabilityScore: score,
            atmosphere: null,
        };
    });

    return {
        planets,
        count: planets.length,
        timestamp: new Date().toISOString(),
    };
}

export const GET: RequestHandler = async ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyExoplanetsData());
    }

    try {
        const data = await fetchRealExoplanetsData();
        return json(data);
    } catch {
        return json(getDummyExoplanetsData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
