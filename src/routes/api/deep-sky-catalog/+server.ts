import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyDeepSkyCatalogData } from '$lib/data/deep-sky-catalog';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { DeepSkyCatalogData, DeepSkyObject } from '$lib/types/api';

const TYPE_MAP: Record<string, DeepSkyObject['type']> = {
    Galaxy: 'galaxy',
    Nebula: 'nebula',
    'Open Cluster': 'cluster',
    'Globular Cluster': 'cluster',
    'Planetary Nebula': 'nebula',
    'Supernova Remnant': 'supernova-remnant',
    'Emission Nebula': 'nebula',
    'Reflection Nebula': 'nebula',
    Cluster: 'cluster',
};

async function fetchRealDeepSkyCatalogData(): Promise<DeepSkyCatalogData> {
    const res = await fetch(
        'https://datastro.eu/api/explore/v2.1/catalog/datasets/deep-sky-objects/records?limit=20&select=name1,name2,type,constellation,ra,dec,mag,distance_ly',
    );
    const raw = await res.json();

    const currentMonth = new Date().toLocaleString('en', { month: 'long' });
    const monthIndex = new Date().getMonth();
    const bestMonths = [
        new Date(2025, monthIndex, 1).toLocaleString('en', { month: 'long' }),
        new Date(2025, monthIndex + 1, 1).toLocaleString('en', { month: 'long' }),
        new Date(2025, monthIndex + 2, 1).toLocaleString('en', { month: 'long' }),
    ];

    const objects: DeepSkyObject[] = (raw.results || []).map(
        (record: Record<string, unknown>, i: number) => {
            const rawType = (record.type as string) || 'Galaxy';
            const mappedType = TYPE_MAP[rawType] || 'galaxy';

            const raVal = record.ra;
            const decVal = record.dec;
            const raStr =
                typeof raVal === 'number' ? formatRA(raVal) : String(raVal || '00h 00m 00s');
            const decStr =
                typeof decVal === 'number' ? formatDec(decVal) : String(decVal || '+00° 00′ 00″');

            return {
                id: `DSO-LIVE-${i}`,
                name: (record.name1 as string) || `DSO-${i}`,
                catalogDesignation:
                    (record.name2 as string) || (record.name1 as string) || `Unknown-${i}`,
                type: mappedType,
                constellation: (record.constellation as string) || 'Unknown',
                rightAscension: raStr,
                declination: decStr,
                apparentMagnitude: Number(record.mag) || 10,
                distanceLightYears: Number(record.distance_ly) || 1000,
                imagingRecommendation: {
                    minAperture:
                        mappedType === 'galaxy' ? 200 : mappedType === 'cluster' ? 50 : 100,
                    idealExposure:
                        mappedType === 'galaxy' ? 240 : mappedType === 'cluster' ? 60 : 180,
                    bestMonths,
                    filterSuggestion:
                        mappedType === 'nebula'
                            ? 'H-alpha or dual-narrowband'
                            : mappedType === 'galaxy'
                              ? 'Luminance + RGB'
                              : 'Broadband RGB',
                },
            };
        },
    );

    return {
        objects,
        count: objects.length,
        timestamp: new Date().toISOString(),
    };
}

function formatRA(degrees: number): string {
    const hours = degrees / 15;
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.round(((hours - h) * 60 - m) * 60 * 10) / 10;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${s.toFixed(1)}s`;
}

function formatDec(degrees: number): string {
    const sign = degrees >= 0 ? '+' : '-';
    const abs = Math.abs(degrees);
    const d = Math.floor(abs);
    const m = Math.floor((abs - d) * 60);
    const s = Math.round(((abs - d) * 60 - m) * 60);
    return `${sign}${String(d).padStart(2, '0')}° ${String(m).padStart(2, '0')}′ ${String(s).padStart(2, '0')}″`;
}

export const GET: RequestHandler = async ({ cookies }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyDeepSkyCatalogData());
    }

    try {
        const data = await fetchRealDeepSkyCatalogData();
        return json(data);
    } catch {
        return json(getDummyDeepSkyCatalogData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
