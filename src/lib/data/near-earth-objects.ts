import type { NearEarthObjectsData } from '$lib/types/api';

export function getDummyNearEarthObjectsData(): NearEarthObjectsData {
    return {
        objects: [
            {
                id: 'NEO-2025-AX7',
                name: '2025 AX7',
                designation: '2025 AX7',
                estimatedDiameter: { min: 140, max: 310 },
                isHazardous: true,
                closeApproachDate: '2025-03-22T16:45:00Z',
                missDistance: { astronomical: 0.032, kilometers: 4787520 },
                relativeVelocity: 18.4,
                orbitClass: 'Apollo',
            },
            {
                id: 'NEO-2025-BQ3',
                name: '2025 BQ3',
                designation: '2025 BQ3',
                estimatedDiameter: { min: 45, max: 100 },
                isHazardous: false,
                closeApproachDate: '2025-03-25T09:12:00Z',
                missDistance: { astronomical: 0.089, kilometers: 13313880 },
                relativeVelocity: 12.1,
                orbitClass: 'Aten',
            },
            {
                id: 'NEO-2025-CR1',
                name: '2025 CR1',
                designation: '2025 CR1',
                estimatedDiameter: { min: 520, max: 1160 },
                isHazardous: true,
                closeApproachDate: '2025-04-02T21:30:00Z',
                missDistance: { astronomical: 0.051, kilometers: 7628040 },
                relativeVelocity: 24.7,
                orbitClass: 'Apollo',
            },
            {
                id: 'NEO-2025-DM5',
                name: '2025 DM5',
                designation: '2025 DM5',
                estimatedDiameter: { min: 22, max: 49 },
                isHazardous: false,
                closeApproachDate: '2025-04-08T04:55:00Z',
                missDistance: { astronomical: 0.124, kilometers: 18547680 },
                relativeVelocity: 8.3,
                orbitClass: 'Amor',
            },
            {
                id: 'NEO-2025-EF2',
                name: '2025 EF2',
                designation: '2025 EF2',
                estimatedDiameter: { min: 210, max: 470 },
                isHazardous: true,
                closeApproachDate: '2025-04-11T13:20:00Z',
                missDistance: { astronomical: 0.045, kilometers: 6730800 },
                relativeVelocity: 21.9,
                orbitClass: 'Apollo',
            },
        ],
        count: 5,
        queryPeriod: { start: '2025-03-15', end: '2025-04-14' },
        timestamp: '2025-03-15T12:00:00Z',
    };
}

export function getNearEarthObjectsPreview() {
    const data = getDummyNearEarthObjectsData();
    const closest = data.objects.reduce((a, b) =>
        a.missDistance.astronomical < b.missDistance.astronomical ? a : b,
    );
    return {
        totalTracked: data.count,
        hazardousCount: data.objects.filter((o) => o.isHazardous).length,
        closestApproach: closest.name,
        closestDistance: closest.missDistance.kilometers,
    };
}
