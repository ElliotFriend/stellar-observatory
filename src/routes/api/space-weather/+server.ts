import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummySpaceWeatherData } from '$lib/data/space-weather';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { SpaceWeatherData } from '$lib/types/api';

const idx = (fields: string[], name: string) => fields.indexOf(name);

export const GET: RequestHandler = async ({ cookies, fetch }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummySpaceWeatherData());
    }

    try {
        const [windRes, magRes, kpRes, flareRes] = await Promise.all([
            fetch('https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json'),
            fetch('https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json'),
            fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
            fetch('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json'),
        ]);

        const windData: string[][] = await windRes.json();
        const magData: string[][] = await magRes.json();
        const kpData: string[][] = await kpRes.json();
        const flareData: Record<string, unknown>[] = await flareRes.json(); // only one entry

        // Solar wind: last row of plasma data (skip header row)
        const windFields = windData[0];
        const latestWind = windData.length > 1 ? windData[windData.length - 1] : null;
        const magFields = magData[0];
        const latestMag = magData.length > 1 ? magData[magData.length - 1] : null;

        // Kp index entries (skip header row)
        const kpFields = kpData[0];
        const kpEntries = kpData.slice(1);
        const storms = kpEntries
            .filter((entry) => parseFloat(entry[idx(kpFields, 'Kp')]) >= 4)
            .slice(-5)
            .map((entry) => {
                const kp = Math.round(parseFloat(entry[idx(kpFields, 'Kp')]));
                const severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme' =
                    kp >= 8
                        ? 'extreme'
                        : kp >= 7
                          ? 'severe'
                          : kp >= 6
                            ? 'strong'
                            : kp >= 5
                              ? 'moderate'
                              : 'minor';
                return {
                    kpIndex: kp,
                    severity,
                    timeTag: entry[idx(kpFields, 'time_tag')],
                };
            });

        // Solar flares
        const flares = flareData.slice(-25).map((flare) => ({
            sourceSatellite: flare.satellite as number,
            class:
                (flare.max_class as string) ||
                (flare.begin_class as string) ||
                (flare.end_class as string),
            peakTime: (flare.max_time as string) || (flare.begin_time as string),
            duration: Math.round(
                (new Date((flare.end_time as string) || (flare.max_time as string)).getTime() -
                    new Date(flare.begin_time as string).getTime()) /
                    60000,
            ),
        }));

        // Aurora: derive rough probabilities from latest Kp
        const latestKp = kpEntries.length > 0 ? parseFloat(kpEntries[kpEntries.length - 1][1]) : 2;
        const baseProb = Math.min(latestKp / 9, 1);

        return json({
            solarWind:
                latestWind && latestMag
                    ? {
                          speed: parseFloat(latestWind[idx(windFields, 'speed')]),
                          density: parseFloat(latestWind[idx(windFields, 'density')]),
                          temperature: parseFloat(latestWind[idx(windFields, 'temperature')]),
                          magneticField: {
                              bx: parseFloat(latestMag[idx(magFields, 'bx_gsm')]),
                              by: parseFloat(latestMag[idx(magFields, 'by_gsm')]),
                              bz: parseFloat(latestMag[idx(magFields, 'bz_gsm')]),
                          },
                      }
                    : null,
            geomagneticStorms: storms,
            solarFlares: flares,
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
        } satisfies SpaceWeatherData);
    } catch (err) {
        console.error('Failed to fetch space weather data:', err);
        return json(getDummySpaceWeatherData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
