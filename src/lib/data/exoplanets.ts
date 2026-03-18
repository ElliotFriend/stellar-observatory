import type { ExoplanetsData } from '$lib/types/api.js';

export function getDummyExoplanetsData(): ExoplanetsData {
    return {
        planets: [
            {
                id: 'EXO-001',
                name: 'Kepler-442b',
                hostStar: 'Kepler-442',
                distanceLightYears: 1206,
                orbitalPeriod: 112.3,
                mass: 2.34,
                radius: 1.34,
                equilibriumTemp: 233,
                discoveryMethod: 'Transit',
                discoveryYear: 2015,
                habitabilityScore: 0.84,
                atmosphere: 'N₂/CO₂ (modeled)',
            },
            {
                id: 'EXO-002',
                name: 'TRAPPIST-1e',
                hostStar: 'TRAPPIST-1',
                distanceLightYears: 39.6,
                orbitalPeriod: 6.1,
                mass: 0.692,
                radius: 0.92,
                equilibriumTemp: 251,
                discoveryMethod: 'Transit',
                discoveryYear: 2017,
                habitabilityScore: 0.91,
                atmosphere: 'Possible H₂O-rich',
            },
            {
                id: 'EXO-003',
                name: 'Proxima Centauri b',
                hostStar: 'Proxima Centauri',
                distanceLightYears: 4.24,
                orbitalPeriod: 11.2,
                mass: 1.17,
                radius: 1.08,
                equilibriumTemp: 234,
                discoveryMethod: 'Radial Velocity',
                discoveryYear: 2016,
                habitabilityScore: 0.72,
                atmosphere: null,
            },
            {
                id: 'EXO-004',
                name: 'TOI-700 d',
                hostStar: 'TOI-700',
                distanceLightYears: 101.4,
                orbitalPeriod: 37.4,
                mass: 1.72,
                radius: 1.19,
                equilibriumTemp: 269,
                discoveryMethod: 'Transit',
                discoveryYear: 2020,
                habitabilityScore: 0.78,
                atmosphere: 'CO₂-dominated (modeled)',
            },
            {
                id: 'EXO-005',
                name: 'K2-18b',
                hostStar: 'K2-18',
                distanceLightYears: 124,
                orbitalPeriod: 32.9,
                mass: 8.63,
                radius: 2.61,
                equilibriumTemp: 255,
                discoveryMethod: 'Transit',
                discoveryYear: 2015,
                habitabilityScore: 0.67,
                atmosphere: 'H₂/He with H₂O detected',
            },
            {
                id: 'EXO-006',
                name: 'LHS 1140 b',
                hostStar: 'LHS 1140',
                distanceLightYears: 48.8,
                orbitalPeriod: 24.7,
                mass: 5.6,
                radius: 1.73,
                equilibriumTemp: 226,
                discoveryMethod: 'Transit',
                discoveryYear: 2017,
                habitabilityScore: 0.75,
                atmosphere: 'N₂-rich (candidate)',
            },
        ],
        count: 6,
        timestamp: '2025-03-15T12:00:00Z',
    };
}

export function getExoplanetsPreview() {
    const data = getDummyExoplanetsData();
    const topHabitable = data.planets.reduce((a, b) =>
        a.habitabilityScore > b.habitabilityScore ? a : b,
    );
    return {
        totalConfirmed: data.count,
        topCandidate: topHabitable.name,
        topScore: topHabitable.habitabilityScore,
        nearestLightYears: Math.min(...data.planets.map((p) => p.distanceLightYears)),
    };
}
