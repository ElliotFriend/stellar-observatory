import type { x402HTTPClient } from '@x402/core/client';
import { paidFetch } from './x402-client.js';

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    handler: (
        args: Record<string, unknown>,
        httpClient: x402HTTPClient,
        baseUrl: string,
    ) => Promise<unknown>;
}

const endpointTools: Array<{ name: string; slug: string; price: string; description: string }> = [
    {
        name: 'get-space-weather',
        slug: 'space-weather',
        price: '$0.001',
        description:
            'Fetch space weather data including solar wind, geomagnetic storms, solar flares, and aurora forecast',
    },
    {
        name: 'get-near-earth-objects',
        slug: 'near-earth-objects',
        price: '$0.01',
        description: 'Fetch near-Earth object tracking data for approaching asteroids and comets',
    },
    {
        name: 'get-exoplanets',
        slug: 'exoplanets',
        price: '$0.05',
        description: 'Fetch confirmed exoplanet database with habitability scores',
    },
    {
        name: 'get-deep-sky-catalog',
        slug: 'deep-sky-catalog',
        price: '$0.10',
        description: 'Fetch deep sky object catalog including galaxies, nebulae, and clusters',
    },
    {
        name: 'get-gravitational-waves',
        slug: 'gravitational-waves',
        price: '$0.25',
        description: 'Fetch LIGO/Virgo gravitational wave detection events',
    },
];

export const tools: ToolDefinition[] = [
    ...endpointTools.map((ep) => ({
        name: ep.name,
        description: `${ep.description} (${ep.price})`,
        inputSchema: { type: 'object' as const, properties: {}, required: [] as string[] },
        handler: async (
            _args: Record<string, unknown>,
            httpClient: x402HTTPClient,
            baseUrl: string,
        ) => {
            const res = await paidFetch(httpClient, `${baseUrl}/api/${ep.slug}`);
            if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            return res.json();
        },
    })),
    {
        name: 'fetch-paid-resource',
        description: 'Generic x402 fetcher for any URL protected by the x402 payment protocol',
        inputSchema: {
            type: 'object',
            properties: {
                url: { type: 'string', description: 'The URL to fetch' },
                method: {
                    type: 'string',
                    description: 'HTTP method (default: GET)',
                    enum: ['GET', 'POST', 'PUT', 'DELETE'],
                },
            },
            required: ['url'],
        },
        handler: async (
            args: Record<string, unknown>,
            httpClient: x402HTTPClient,
            _baseUrl: string, // eslint-disable-line @typescript-eslint/no-unused-vars
        ) => {
            const url = args.url as string;
            const method = (args.method as string) ?? 'GET';
            const res = await paidFetch(httpClient, url, { method });
            if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type') ?? '';
            if (contentType.includes('json')) return res.json();
            return res.text();
        },
    },
];

export function getToolByName(name: string): ToolDefinition | undefined {
    return tools.find((t) => t.name === name);
}
