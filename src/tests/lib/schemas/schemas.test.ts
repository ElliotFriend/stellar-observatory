import { describe, it, expect } from 'vitest';
import {
    SpaceWeatherData,
    NearEarthObjectsData,
    ExoplanetsData,
    DeepSkyCatalogData,
    GravitationalWavesData,
    SetNetworkRequest,
    SetNetworkResponse,
    Network,
    ErrorResponse,
} from '$lib/schemas';
import { getDummySpaceWeatherData } from '$lib/data/space-weather';
import { getDummyNearEarthObjectsData } from '$lib/data/near-earth-objects';
import { getDummyExoplanetsData } from '$lib/data/exoplanets';
import { getDummyDeepSkyCatalogData } from '$lib/data/deep-sky-catalog';
import { getDummyGravitationalWavesData } from '$lib/data/gravitational-waves';

describe('schemas — round-trip dummy data', () => {
    it('SpaceWeatherData accepts dummy', () => {
        expect(() => SpaceWeatherData.parse(getDummySpaceWeatherData())).not.toThrow();
    });

    it('NearEarthObjectsData accepts dummy', () => {
        expect(() => NearEarthObjectsData.parse(getDummyNearEarthObjectsData())).not.toThrow();
    });

    it('ExoplanetsData accepts dummy', () => {
        expect(() => ExoplanetsData.parse(getDummyExoplanetsData())).not.toThrow();
    });

    it('DeepSkyCatalogData accepts dummy', () => {
        expect(() => DeepSkyCatalogData.parse(getDummyDeepSkyCatalogData())).not.toThrow();
    });

    it('GravitationalWavesData accepts dummy', () => {
        expect(() => GravitationalWavesData.parse(getDummyGravitationalWavesData())).not.toThrow();
    });
});

describe('schemas — negative cases', () => {
    it('SpaceWeatherData rejects missing timestamp', () => {
        const bad = { ...getDummySpaceWeatherData(), timestamp: undefined };
        expect(() => SpaceWeatherData.parse(bad)).toThrow();
    });

    it('NearEarthObjectsData rejects non-numeric count', () => {
        const bad = { ...getDummyNearEarthObjectsData(), count: 'five' };
        expect(() => NearEarthObjectsData.parse(bad)).toThrow();
    });

    it('ExoplanetsData rejects out-of-range habitabilityScore', () => {
        const dummy = getDummyExoplanetsData();
        const bad = {
            ...dummy,
            planets: [{ ...dummy.planets[0], habitabilityScore: 1.5 }, ...dummy.planets.slice(1)],
        };
        expect(() => ExoplanetsData.parse(bad)).toThrow();
    });

    it('DeepSkyCatalogData rejects unknown object type', () => {
        const dummy = getDummyDeepSkyCatalogData();
        const bad = {
            ...dummy,
            objects: [{ ...dummy.objects[0], type: 'wormhole' }, ...dummy.objects.slice(1)],
        };
        expect(() => DeepSkyCatalogData.parse(bad)).toThrow();
    });

    it('GravitationalWavesData rejects confidence above 1', () => {
        const dummy = getDummyGravitationalWavesData();
        const bad = {
            ...dummy,
            events: [{ ...dummy.events[0], confidence: 1.1 }, ...dummy.events.slice(1)],
        };
        expect(() => GravitationalWavesData.parse(bad)).toThrow();
    });
});

describe('schemas — network', () => {
    it('SetNetworkRequest accepts valid network', () => {
        expect(SetNetworkRequest.parse({ network: 'stellar:testnet' })).toEqual({
            network: 'stellar:testnet',
        });
    });

    it('SetNetworkRequest rejects unknown network', () => {
        expect(() => SetNetworkRequest.parse({ network: 'stellar:devnet' })).toThrow();
    });

    it('SetNetworkResponse round-trips', () => {
        expect(SetNetworkResponse.parse({ network: 'stellar:pubnet' })).toEqual({
            network: 'stellar:pubnet',
        });
    });

    it('Network enum values', () => {
        expect(Network.options).toEqual(['stellar:testnet', 'stellar:pubnet']);
    });
});

describe('schemas — ErrorResponse (problem+json)', () => {
    it('accepts a minimal error', () => {
        expect(() => ErrorResponse.parse({ title: 'Bad Request', status: 400 })).not.toThrow();
    });

    it('accepts full RFC 9457 fields', () => {
        expect(() =>
            ErrorResponse.parse({
                type: 'https://example.com/probs/payment-required',
                title: 'Payment required',
                status: 402,
                detail: 'Provide a valid x402 or MPP payment header.',
                instance: '/api/exoplanets',
            }),
        ).not.toThrow();
    });

    it('rejects missing title', () => {
        expect(() => ErrorResponse.parse({ status: 500 })).toThrow();
    });
});
