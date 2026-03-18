import {
    getSpaceWeatherPreview,
    getNearEarthObjectsPreview,
    getExoplanetsPreview,
    getDeepSkyCatalogPreview,
    getGravitationalWavesPreview,
} from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    const previews: Record<string, Record<string, unknown>> = {
        'space-weather': getSpaceWeatherPreview(),
        'near-earth-objects': getNearEarthObjectsPreview(),
        exoplanets: getExoplanetsPreview(),
        'deep-sky-catalog': getDeepSkyCatalogPreview(),
        'gravitational-waves': getGravitationalWavesPreview(),
    };

    return {
        previews,
    };
};
