import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDummyDeepSkyCatalogData } from '$lib/data/deep-sky-catalog';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie, isTestnet } from '$lib/config/network';
import type { DeepSkyCatalogData, DeepSkyObject } from '$lib/types/api';

// source: http://www.klima-luft.de/steinicke/ngcic/rev2000/Explan.htm#3 (section 3.5)
const TYPE_MAP: Record<string, DeepSkyObject['type']> = {
    '*': 'star', // star
    '**': 'star', // double star
    '***': 'star', // star group
    Ast: 'star', // asterism
    DN: 'nebula', // dark nebula
    GC: 'cluster', // globular cluster
    Gxy: 'galaxy', // galaxy
    GxyCld: 'galaxy', // galaxy
    HIIRgn: 'nebula', // hydrogen-ionized region... it's gassy, so we'll call it a nebula
    MWSC: 'cluster', // milky way star cluster
    NF: 'not-found', // not sure why this is here...
    Neb: 'nebula', // nebula
    'Neb?': 'nebula', // nebula
    OC: 'cluster', // open cluster
    'OC+Neb': 'nebula', // open cluster and nebula
    PD: 'galaxy', // peculiar dwarf galaxy
    PN: 'nebula', // planetary nebular
    SNR: 'supernova-remnant', // supernova remnant
};

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

const datastroParams = new URLSearchParams({
    limit: '50',
    select: ['id', 'name', 'type', 'const', 'ra', 'dec', 'mag', 'cat1', 'id1'].join(','),
    where: 'name is not null',
    order_by: 'mag asc',
});
const datastroUrl = `https://www.datastro.eu/api/explore/v2.1/catalog/datasets/deep-sky-objects/records?${datastroParams.toString()}`;

export const GET: RequestHandler = async ({ cookies, fetch }) => {
    const network = getNetworkFromCookie(cookies.get(NETWORK_COOKIE_NAME));

    if (isTestnet(network)) {
        return json(getDummyDeepSkyCatalogData());
    }

    try {
        const res = await fetch(datastroUrl);
        const raw = await res.json();

        const objects: DeepSkyObject[] = (raw.results || []).map(
            (record: Record<string, unknown>) => {
                const rawType = (record.type as string) || 'Galaxy';
                const mappedType = TYPE_MAP[rawType] || 'galaxy';

                const raVal = record.ra;
                const decVal = record.dec;
                const raStr =
                    typeof raVal === 'number' ? formatRA(raVal) : String(raVal || '00h 00m 00s');
                const decStr =
                    typeof decVal === 'number'
                        ? formatDec(decVal)
                        : String(decVal || '+00° 00′ 00″');

                let catalogDesignation = '';
                if (record.cat1) {
                    catalogDesignation += record.cat1;
                }
                if (record.id1) {
                    catalogDesignation += ` ${record.id1}`;
                }

                return {
                    id: record.id,
                    name: (record.name as string) || null,
                    catalogDesignation,
                    type: mappedType,
                    constellation: (record.const as string) || 'Unknown',
                    rightAscension: raStr,
                    declination: decStr,
                    apparentMagnitude: Number(record.mag),
                    imagingRecommendation: {
                        minAperture:
                            mappedType === 'galaxy' ? 200 : mappedType === 'cluster' ? 50 : 100,
                        idealExposure:
                            mappedType === 'galaxy' ? 240 : mappedType === 'cluster' ? 60 : 180,
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

        return json({
            objects,
            count: objects.length,
            timestamp: new Date().toISOString(),
        } satisfies DeepSkyCatalogData);
    } catch (err) {
        console.error('Failed to fetch deep sky objects:', err);
        return json(getDummyDeepSkyCatalogData(), {
            headers: { 'X-Data-Source': 'fallback' },
        });
    }
};
