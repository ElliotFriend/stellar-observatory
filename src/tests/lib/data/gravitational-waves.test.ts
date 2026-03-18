import { describe, it, expect } from 'vitest';
import {
    getDummyGravitationalWavesData,
    getGravitationalWavesPreview,
} from '$lib/data/gravitational-waves';

describe('gravitational waves data', () => {
    it('returns events with required fields', () => {
        const data = getDummyGravitationalWavesData();
        expect(data.events.length).toBeGreaterThan(0);
        expect(data.count).toBe(data.events.length);
        expect(data.observingRun).toBeTruthy();
        for (const event of data.events) {
            expect(event.id).toBeTruthy();
            expect(event.eventName).toBeTruthy();
            expect([
                'binary-black-hole',
                'binary-neutron-star',
                'neutron-star-black-hole',
                'unknown',
            ]).toContain(event.source);
            expect(event.estimatedDistance).toBeGreaterThan(0);
            expect(event.signalToNoise).toBeGreaterThan(0);
            expect(event.chirpMass).toBeGreaterThan(0);
            expect(event.detectors.length).toBeGreaterThan(0);
            expect(event.confidence).toBeGreaterThan(0);
            expect(event.confidence).toBeLessThanOrEqual(1);
        }
    });

    it('preview returns summary fields', () => {
        const preview = getGravitationalWavesPreview();
        expect(preview.totalEvents).toBeGreaterThan(0);
        expect(preview.observingRun).toBeTruthy();
        expect(preview.latestEvent).toBeTruthy();
        expect(preview.latestSNR).toBeGreaterThan(0);
    });
});
