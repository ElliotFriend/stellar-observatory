import type { SpaceWeatherData } from '$lib/types/api';

export function getDummySpaceWeatherData(): SpaceWeatherData {
    return {
        solarWind: {
            speed: 423.7,
            density: 6.2,
            temperature: 152000,
            magneticField: { bx: -2.1, by: 4.8, bz: -3.5 },
        },
        geomagneticStorms: [
            {
                kpIndex: 6,
                severity: 'moderate',
                timeTag: '2025-03-15T08:30:00Z',
            },
            {
                kpIndex: 4,
                severity: 'minor',
                timeTag: '2025-03-16T14:00:00Z',
            },
        ],
        solarFlares: [
            {
                sourceSatellite: 3,
                class: 'M3.2',
                peakTime: '2025-03-14T11:42:00Z',
                duration: 28,
            },
            {
                sourceSatellite: 1,
                class: 'X1.5',
                peakTime: '2025-03-15T03:17:00Z',
                duration: 45,
            },
            {
                sourceSatellite: 3,
                class: 'C8.7',
                peakTime: '2025-03-15T19:03:00Z',
                duration: 12,
            },
        ],
        auroraForecast: {
            northernHemisphere: [
                { latitude: 65, probability: 0.92 },
                { latitude: 55, probability: 0.61 },
                { latitude: 45, probability: 0.23 },
            ],
            southernHemisphere: [
                { latitude: -65, probability: 0.88 },
                { latitude: -55, probability: 0.54 },
                { latitude: -45, probability: 0.18 },
            ],
        },
        timestamp: '2025-03-15T12:00:00Z',
    };
}

export function getSpaceWeatherPreview() {
    const data = getDummySpaceWeatherData();
    return {
        solarWindSpeed: data.solarWind?.speed,
        activeStorms: data.geomagneticStorms.length,
        maxKpIndex: Math.max(...data.geomagneticStorms.map((s) => s.kpIndex)),
        recentFlareClass: data.solarFlares[data.solarFlares.length - 1]?.class,
    };
}
