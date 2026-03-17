import { describe, it, expect } from 'vitest';
import {
    getNearEarthObjectsData,
    getNearEarthObjectsPreview,
} from '$lib/data/near-earth-objects.js';

describe('near earth objects data', () => {
    it('returns objects with required fields', () => {
        const data = getNearEarthObjectsData();
        expect(data.objects.length).toBeGreaterThan(0);
        expect(data.count).toBe(data.objects.length);
        for (const obj of data.objects) {
            expect(obj.id).toBeTruthy();
            expect(obj.name).toBeTruthy();
            expect(obj.estimatedDiameter.min).toBeLessThan(obj.estimatedDiameter.max);
            expect(typeof obj.isHazardous).toBe('boolean');
            expect(obj.missDistance.astronomical).toBeGreaterThan(0);
            expect(obj.missDistance.kilometers).toBeGreaterThan(0);
            expect(obj.relativeVelocity).toBeGreaterThan(0);
        }
    });

    it('has a valid query period', () => {
        const data = getNearEarthObjectsData();
        const start = new Date(data.queryPeriod.start);
        const end = new Date(data.queryPeriod.end);
        expect(end.getTime()).toBeGreaterThan(start.getTime());
    });

    it('preview returns summary fields', () => {
        const preview = getNearEarthObjectsPreview();
        expect(preview.totalTracked).toBeGreaterThan(0);
        expect(preview.hazardousCount).toBeGreaterThanOrEqual(0);
        expect(preview.closestApproach).toBeTruthy();
        expect(preview.closestDistance).toBeGreaterThan(0);
    });
});
