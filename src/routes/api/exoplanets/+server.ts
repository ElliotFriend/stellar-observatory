import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyExoplanetsData } from '$lib/data/exoplanets';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { ExoplanetsData, Exoplanet } from '$lib/types/api';

function calculateHabitability(eqTemp: number, radius: number, mass: number): number {
    // Simple habitability heuristic: temperature near 200-310K, radius 0.5-2.5, mass <10
    let score = 0;
    if (eqTemp >= 200 && eqTemp <= 310) score += 0.4;
    else if (eqTemp >= 150 && eqTemp <= 350) score += 0.2;
    if (radius >= 0.5 && radius <= 2.5) score += 0.3;
    else if (radius >= 0.3 && radius <= 4) score += 0.15;
    if (mass < 10) score += 0.2;
    else if (mass < 20) score += 0.1;
    score = Math.round(Math.min(score, 1) * 100) / 100;
    return score;
}

const PARSECS_TO_LIGHTYEARS = 3.26156;

function parsecsToLightyears(parsecs: number | null): number | null {
    return parsecs ? Math.round(Number(parsecs) * PARSECS_TO_LIGHTYEARS * 10) / 10 : null;
}

const columns: string[] = [
    'pl_name', // planet name
    'hostname', // host star name
    'sy_dist', // distance to planetary system (in parsecs)
    'pl_orbper', // time the planet takes to orbit around host star
    'pl_bmasse', // planet mass estimate
    'pl_rade', // planet radius (in units of earth radius)
    'pl_eqt', // planet equilibrium temperature (in Kelvin)
    'discoverymethod', // how the planet was first identified
    'disc_year', // year the planet was discovered
];
const where: string[] = ['pl_bmasse IS NOT NULL', 'pl_rade IS NOT NULL', 'pl_eqt IS NOT NULL'];
const order: string[] = ['pl_eqt ASC'];
const query = [
    `SELECT TOP 50 ${columns.join(',')} FROM pscomppars`,
    `WHERE ${where.join(' AND ')}`,
    `ORDER BY ${order.join(', ')}`,
].join(' ');

const exoplanetUrl = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(query)}&format=json`;

export const GET: RequestHandler = async ({ cookies, fetch }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyExoplanetsData());
    }

    try {
        const res = await fetch(exoplanetUrl);
        const raw: Record<string, unknown>[] = await res.json();

        const planets: Exoplanet[] = raw.map((row) => {
            const eqTemp = Number(row.pl_eqt);
            const radius = Number(row.pl_rade);
            const mass = Number(row.pl_bmasse);

            // Calculate the habitability score of the exoplanet
            const score = calculateHabitability(eqTemp, radius, mass);

            // Convert distance units
            const distLY = parsecsToLightyears(Number(row.sy_dist));

            return {
                name: row.pl_name as string,
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

        return json({
            planets,
            count: planets.length,
            timestamp: new Date().toISOString(),
        } satisfies ExoplanetsData);
    } catch (err) {
        console.error('Failed to fetch exoplanets:', err);
        return json(getDummyExoplanetsData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
