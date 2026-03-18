import {
    getSpaceWeatherPreview,
    getNearEarthObjectsPreview,
    getExoplanetsPreview,
    getDeepSkyCatalogPreview,
    getGravitationalWavesPreview,
} from '$lib/data';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    return {
        previews: {
            'space-weather': getSpaceWeatherPreview(),
            'near-earth-objects': getNearEarthObjectsPreview(),
            exoplanets: getExoplanetsPreview(),
            'deep-sky-catalog': getDeepSkyCatalogPreview(),
            'gravitational-waves': getGravitationalWavesPreview(),
        },
    };
};
