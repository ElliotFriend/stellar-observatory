import { describe, it, expect } from 'vitest';
import { getDummyDeepSkyCatalogData, getDeepSkyCatalogPreview } from '$lib/data/deep-sky-catalog';

describe('deep sky catalog data', () => {
    it('returns objects with required fields', () => {
        const data = getDummyDeepSkyCatalogData();
        expect(data.objects.length).toBeGreaterThan(0);
        expect(data.count).toBe(data.objects.length);
        for (const obj of data.objects) {
            expect(obj.id).toBeTruthy();
            expect(obj.name).toBeTruthy();
            expect(obj.catalogDesignation).toBeTruthy();
            expect(['galaxy', 'nebula', 'cluster', 'supernova-remnant']).toContain(obj.type);
            expect(obj.constellation).toBeTruthy();
            expect(obj.apparentMagnitude).toBeGreaterThan(0);
            expect(obj.imagingRecommendation.minAperture).toBeGreaterThan(0);
            expect(obj.imagingRecommendation.idealExposure).toBeGreaterThan(0);
            expect(obj.imagingRecommendation.bestMonths.length).toBeGreaterThan(0);
            expect(obj.imagingRecommendation.filterSuggestion).toBeTruthy();
        }
    });

    it('preview returns summary fields', () => {
        const preview = getDeepSkyCatalogPreview();
        expect(preview.totalObjects).toBeGreaterThan(0);
        expect(preview.featuredObject).toBeTruthy();
        expect(preview.featuredType).toBeTruthy();
    });
});
