import { describe, it, expect } from 'vitest';
import { getExoplanetsData, getExoplanetsPreview } from '$lib/data/exoplanets.js';

describe('exoplanets data', () => {
	it('returns planets with required fields', () => {
		const data = getExoplanetsData();
		expect(data.planets.length).toBeGreaterThan(0);
		expect(data.count).toBe(data.planets.length);
		for (const planet of data.planets) {
			expect(planet.id).toBeTruthy();
			expect(planet.name).toBeTruthy();
			expect(planet.hostStar).toBeTruthy();
			expect(planet.distanceLightYears).toBeGreaterThan(0);
			expect(planet.orbitalPeriod).toBeGreaterThan(0);
			expect(planet.mass).toBeGreaterThan(0);
			expect(planet.radius).toBeGreaterThan(0);
			expect(planet.habitabilityScore).toBeGreaterThanOrEqual(0);
			expect(planet.habitabilityScore).toBeLessThanOrEqual(1);
			expect(planet.discoveryYear).toBeGreaterThan(1990);
		}
	});

	it('preview returns summary fields', () => {
		const preview = getExoplanetsPreview();
		expect(preview.totalConfirmed).toBeGreaterThan(0);
		expect(preview.topCandidate).toBeTruthy();
		expect(preview.topScore).toBeGreaterThan(0);
		expect(preview.nearestLightYears).toBeGreaterThan(0);
	});
});
