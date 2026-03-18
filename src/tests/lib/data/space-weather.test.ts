import { describe, it, expect } from 'vitest';
import { getDummySpaceWeatherData, getSpaceWeatherPreview } from '$lib/data/space-weather.js';

describe('space weather data', () => {
    it('returns valid solar wind data', () => {
        const data = getDummySpaceWeatherData();
        expect(data.solarWind.speed).toBeGreaterThan(0);
        expect(data.solarWind.density).toBeGreaterThan(0);
        expect(data.solarWind.temperature).toBeGreaterThan(0);
        expect(data.solarWind.magneticField).toHaveProperty('bx');
        expect(data.solarWind.magneticField).toHaveProperty('by');
        expect(data.solarWind.magneticField).toHaveProperty('bz');
    });

    it('returns geomagnetic storms with valid kp indices', () => {
        const data = getDummySpaceWeatherData();
        expect(data.geomagneticStorms.length).toBeGreaterThan(0);
        for (const storm of data.geomagneticStorms) {
            expect(storm.kpIndex).toBeGreaterThanOrEqual(0);
            expect(storm.kpIndex).toBeLessThanOrEqual(9);
            expect(['minor', 'moderate', 'strong', 'severe', 'extreme']).toContain(storm.severity);
        }
    });

    it('returns solar flares with valid classes', () => {
        const data = getDummySpaceWeatherData();
        expect(data.solarFlares.length).toBeGreaterThan(0);
        for (const flare of data.solarFlares) {
            expect(flare.class).toMatch(/^[ABCMX]\d/);
            expect(flare.duration).toBeGreaterThan(0);
        }
    });

    it('returns aurora forecast for both hemispheres', () => {
        const data = getDummySpaceWeatherData();
        expect(data.auroraForecast.northernHemisphere.length).toBeGreaterThan(0);
        expect(data.auroraForecast.southernHemisphere.length).toBeGreaterThan(0);
        for (const entry of data.auroraForecast.northernHemisphere) {
            expect(entry.probability).toBeGreaterThanOrEqual(0);
            expect(entry.probability).toBeLessThanOrEqual(1);
        }
    });

    it('has a timestamp', () => {
        const data = getDummySpaceWeatherData();
        expect(data.timestamp).toBeTruthy();
        expect(new Date(data.timestamp).getTime()).not.toBeNaN();
    });

    it('preview returns summary fields', () => {
        const preview = getSpaceWeatherPreview();
        expect(preview.solarWindSpeed).toBeGreaterThan(0);
        expect(preview.activeStorms).toBeGreaterThanOrEqual(0);
        expect(preview.maxKpIndex).toBeGreaterThanOrEqual(0);
        expect(preview.recentFlareClass).toBeTruthy();
    });
});
