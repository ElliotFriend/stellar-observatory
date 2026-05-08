import type { z } from 'zod';
import type { EndpointConfig } from '$lib/types/api';
import {
    SpaceWeatherData,
    NearEarthObjectsData,
    ExoplanetsData,
    DeepSkyCatalogData,
    GravitationalWavesData,
    SetNetworkRequest,
    SetNetworkResponse,
} from '$lib/schemas';

export const endpoints: EndpointConfig[] = [
    {
        slug: 'space-weather',
        path: '/api/space-weather',
        method: 'GET',
        price: '$0.0001',
        description: 'Solar wind, geomagnetic storms, solar flares, aurora forecast',
        previewDescription: 'Real-time solar wind speed and geomagnetic activity index',
        icon: '☀',
        summary: 'Real-time space weather',
        tags: ['stellar-data'],
        responseSchema: SpaceWeatherData,
    },
    {
        slug: 'near-earth-objects',
        path: '/api/near-earth-objects',
        method: 'GET',
        price: '$0.001',
        description: 'Approaching asteroids and comets within 30 days',
        previewDescription: 'Count of tracked near-Earth objects and closest approach',
        icon: '☄',
        summary: 'Near-Earth objects approaching within 30 days',
        tags: ['stellar-data'],
        responseSchema: NearEarthObjectsData,
    },
    {
        slug: 'exoplanets',
        path: '/api/exoplanets',
        method: 'GET',
        price: '$0.005',
        description: 'Confirmed exoplanet database with habitability scores',
        previewDescription: 'Total confirmed exoplanets and top habitability candidate',
        icon: '🪐',
        summary: 'Confirmed exoplanet catalog',
        tags: ['stellar-data'],
        responseSchema: ExoplanetsData,
    },
    {
        slug: 'deep-sky-catalog',
        path: '/api/deep-sky-catalog',
        method: 'GET',
        price: '$0.01',
        description: 'Galaxies, nebulae, clusters with imaging recommendations',
        previewDescription: 'Featured deep sky object and optimal viewing window',
        icon: '🌌',
        summary: 'Deep-sky object catalog',
        tags: ['stellar-data'],
        responseSchema: DeepSkyCatalogData,
    },
    {
        slug: 'gravitational-waves',
        path: '/api/gravitational-waves',
        method: 'GET',
        price: '$0.025',
        description: 'LIGO/Virgo gravitational wave detection events',
        previewDescription: 'Latest detection event and signal strength',
        icon: '🌊',
        summary: 'Gravitational-wave detection events',
        tags: ['stellar-data'],
        responseSchema: GravitationalWavesData,
    },
];

export function getEndpointBySlug(slug: string): EndpointConfig | undefined {
    return endpoints.find((ep) => ep.slug === slug);
}

export interface ApiRoute {
    slug: string;
    path: string;
    method: 'GET' | 'POST';
    description: string;
    summary?: string;
    tags?: string[];
    responseSchema: z.ZodTypeAny;
    requestSchema?: z.ZodTypeAny;
    price?: string;
}

const unpaidRoutes: ApiRoute[] = [
    {
        slug: 'set-network',
        path: '/api/network',
        method: 'POST',
        description: 'Persist the active Stellar network choice in a cookie.',
        summary: 'Set active network',
        tags: ['internal'],
        requestSchema: SetNetworkRequest,
        responseSchema: SetNetworkResponse,
    },
];

export const apiRoutes: ApiRoute[] = [
    ...endpoints.map(
        (ep): ApiRoute => ({
            slug: ep.slug,
            path: ep.path,
            method: ep.method,
            description: ep.description,
            summary: ep.summary,
            tags: ep.tags,
            responseSchema: ep.responseSchema,
            price: ep.price,
        }),
    ),
    ...unpaidRoutes,
];
