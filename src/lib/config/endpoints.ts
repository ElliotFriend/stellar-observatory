import type { EndpointConfig } from '$lib/types/api';

export const endpoints: EndpointConfig[] = [
    {
        slug: 'space-weather',
        path: '/api/space-weather',
        price: '$0.0001',
        description: 'Solar wind, geomagnetic storms, solar flares, aurora forecast',
        previewDescription: 'Real-time solar wind speed and geomagnetic activity index',
        icon: '☀',
    },
    {
        slug: 'near-earth-objects',
        path: '/api/near-earth-objects',
        price: '$0.001',
        description: 'Approaching asteroids and comets within 30 days',
        previewDescription: 'Count of tracked near-Earth objects and closest approach',
        icon: '☄',
    },
    {
        slug: 'exoplanets',
        path: '/api/exoplanets',
        price: '$0.005',
        description: 'Confirmed exoplanet database with habitability scores',
        previewDescription: 'Total confirmed exoplanets and top habitability candidate',
        icon: '🪐',
    },
    {
        slug: 'deep-sky-catalog',
        path: '/api/deep-sky-catalog',
        price: '$0.01',
        description: 'Galaxies, nebulae, clusters with imaging recommendations',
        previewDescription: 'Featured deep sky object and optimal viewing window',
        icon: '🌌',
    },
    {
        slug: 'gravitational-waves',
        path: '/api/gravitational-waves',
        price: '$0.025',
        description: 'LIGO/Virgo gravitational wave detection events',
        previewDescription: 'Latest detection event and signal strength',
        icon: '🌊',
    },
];

export function getEndpointBySlug(slug: string): EndpointConfig | undefined {
    return endpoints.find((ep) => ep.slug === slug);
}
