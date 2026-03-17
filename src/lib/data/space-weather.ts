import type { SpaceWeatherData } from '$lib/types/api.js';

export function getSpaceWeatherData(): SpaceWeatherData {
	return {
		solarWind: {
			speed: 423.7,
			density: 6.2,
			temperature: 152000,
			magneticField: { bx: -2.1, by: 4.8, bz: -3.5 }
		},
		geomagneticStorms: [
			{
				id: 'GS-2025-0342',
				kpIndex: 6,
				severity: 'moderate',
				startTime: '2025-03-15T08:30:00Z',
				estimatedEndTime: '2025-03-15T20:00:00Z'
			},
			{
				id: 'GS-2025-0343',
				kpIndex: 4,
				severity: 'minor',
				startTime: '2025-03-16T14:00:00Z',
				estimatedEndTime: '2025-03-16T22:00:00Z'
			}
		],
		solarFlares: [
			{
				id: 'SF-2025-1201',
				class: 'M3.2',
				region: 3842,
				peakTime: '2025-03-14T11:42:00Z',
				duration: 28
			},
			{
				id: 'SF-2025-1202',
				class: 'X1.5',
				region: 3845,
				peakTime: '2025-03-15T03:17:00Z',
				duration: 45
			},
			{
				id: 'SF-2025-1203',
				class: 'C8.7',
				region: 3842,
				peakTime: '2025-03-15T19:03:00Z',
				duration: 12
			}
		],
		auroraForecast: {
			northernHemisphere: [
				{ latitude: 65, probability: 0.92 },
				{ latitude: 55, probability: 0.61 },
				{ latitude: 45, probability: 0.23 }
			],
			southernHemisphere: [
				{ latitude: -65, probability: 0.88 },
				{ latitude: -55, probability: 0.54 },
				{ latitude: -45, probability: 0.18 }
			]
		},
		timestamp: '2025-03-15T12:00:00Z'
	};
}

export function getSpaceWeatherPreview() {
	const data = getSpaceWeatherData();
	return {
		solarWindSpeed: data.solarWind.speed,
		activeStorms: data.geomagneticStorms.length,
		maxKpIndex: Math.max(...data.geomagneticStorms.map((s) => s.kpIndex)),
		recentFlareClass: data.solarFlares[data.solarFlares.length - 1]?.class
	};
}
