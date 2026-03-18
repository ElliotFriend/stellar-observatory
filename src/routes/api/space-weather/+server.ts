import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummySpaceWeatherData } from '$lib/data/space-weather.js';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network.js';
import type { SpaceWeatherData } from '$lib/types/api.js';

async function fetchRealSpaceWeatherData(): Promise<SpaceWeatherData> {
    const [windRes, magRes, kpRes, flareRes] = await Promise.all([
        fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json'),
        fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json'),
        fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
        fetch('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json'),
    ]);

    const windData = await windRes.json();
    const magData = await magRes.json();
    const kpData = await kpRes.json();
    const flareData = await flareRes.json();

    // Solar wind: last row of plasma data (skip header row)
    const latestWind = windData[windData.length - 1];
    const latestMag = magData[magData.length - 1];

    // Kp index entries (skip header row)
    const kpEntries = kpData.slice(1);
    const storms = kpEntries
        .filter((entry: string[]) => parseFloat(entry[1]) >= 4)
        .slice(-5)
        .map((entry: string[], i: number) => {
            const kp = Math.round(parseFloat(entry[1]));
            return {
                id: `GS-LIVE-${i}`,
                kpIndex: kp,
                severity: kp >= 8 ? 'extreme' : kp >= 7 ? 'severe' : kp >= 6 ? 'strong' : kp >= 5 ? 'moderate' : 'minor',
                startTime: entry[0],
                estimatedEndTime: entry[0],
            };
        });

    // Solar flares
    const flares = (Array.isArray(flareData) ? flareData : [])
        .slice(0, 5)
        .map((f: Record<string, unknown>, i: number) => ({
            id: `SF-LIVE-${i}`,
            class: (f.current_class as string) || (f.max_class as string) || 'C1.0',
            region: Number(f.active_region) || 0,
            peakTime: (f.max_time as string) || (f.begin_time as string) || new Date().toISOString(),
            duration: Math.round(
                ((new Date((f.end_time as string) || (f.max_time as string) || Date.now()).getTime()) -
                    (new Date((f.begin_time as string) || Date.now()).getTime())) /
                    60000,
            ) || 10,
        }));

    // Aurora: derive rough probabilities from latest Kp
    const latestKp = kpEntries.length > 0 ? parseFloat(kpEntries[kpEntries.length - 1][1]) : 2;
    const baseProb = Math.min(latestKp / 9, 1);

    return {
        solarWind: {
            speed: parseFloat(latestWind?.[2]) || 400,
            density: parseFloat(latestWind?.[1]) || 5,
            temperature: parseFloat(latestWind?.[3]) || 100000,
            magneticField: {
                bx: parseFloat(latestMag?.[1]) || 0,
                by: parseFloat(latestMag?.[2]) || 0,
                bz: parseFloat(latestMag?.[3]) || 0,
            },
        },
        geomagneticStorms: storms.length > 0 ? storms : [],
        solarFlares: flares.length > 0 ? flares : [],
        auroraForecast: {
            northernHemisphere: [
                { latitude: 65, probability: Math.min(baseProb + 0.3, 1) },
                { latitude: 55, probability: Math.min(baseProb + 0.1, 1) },
                { latitude: 45, probability: Math.max(baseProb - 0.1, 0) },
            ],
            southernHemisphere: [
                { latitude: -65, probability: Math.min(baseProb + 0.25, 1) },
                { latitude: -55, probability: Math.min(baseProb + 0.05, 1) },
                { latitude: -45, probability: Math.max(baseProb - 0.15, 0) },
            ],
        },
        timestamp: new Date().toISOString(),
    };
}

export const GET: RequestHandler = async ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummySpaceWeatherData());
    }

    try {
        const data = await fetchRealSpaceWeatherData();
        return json(data);
    } catch {
        return json(getDummySpaceWeatherData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
