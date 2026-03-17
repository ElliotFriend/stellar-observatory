import type { GravitationalWavesData } from '$lib/types/api.js';

export function getGravitationalWavesData(): GravitationalWavesData {
    return {
        events: [
            {
                id: 'GW-2025-0312A',
                eventName: 'GW250312A',
                detectionTime: '2025-03-12T07:23:14.2Z',
                source: 'binary-black-hole',
                estimatedDistance: 440,
                signalToNoise: 24.3,
                chirpMass: 28.7,
                skyLocalization: { ra: '12h 34m 56s', dec: '+45° 12′ 30″', errorRadius: 12.4 },
                detectors: ['LIGO-Hanford', 'LIGO-Livingston', 'Virgo'],
                confidence: 0.9998,
            },
            {
                id: 'GW-2025-0308B',
                eventName: 'GW250308B',
                detectionTime: '2025-03-08T19:45:02.8Z',
                source: 'binary-neutron-star',
                estimatedDistance: 85,
                signalToNoise: 18.7,
                chirpMass: 1.186,
                skyLocalization: { ra: '08h 12m 33s', dec: '-22° 45′ 10″', errorRadius: 28.1 },
                detectors: ['LIGO-Hanford', 'LIGO-Livingston'],
                confidence: 0.9973,
            },
            {
                id: 'GW-2025-0301C',
                eventName: 'GW250301C',
                detectionTime: '2025-03-01T02:11:45.5Z',
                source: 'neutron-star-black-hole',
                estimatedDistance: 210,
                signalToNoise: 12.1,
                chirpMass: 3.42,
                skyLocalization: { ra: '20h 05m 12s', dec: '+08° 33′ 22″', errorRadius: 45.7 },
                detectors: ['LIGO-Hanford', 'LIGO-Livingston', 'Virgo', 'KAGRA'],
                confidence: 0.9821,
            },
            {
                id: 'GW-2025-0224D',
                eventName: 'GW250224D',
                detectionTime: '2025-02-24T14:58:33.1Z',
                source: 'binary-black-hole',
                estimatedDistance: 1200,
                signalToNoise: 8.4,
                chirpMass: 45.2,
                skyLocalization: { ra: '16h 42m 08s', dec: '-35° 20′ 15″', errorRadius: 82.3 },
                detectors: ['LIGO-Hanford', 'LIGO-Livingston'],
                confidence: 0.9534,
            },
        ],
        count: 4,
        observingRun: 'O5',
        timestamp: '2025-03-15T12:00:00Z',
    };
}

export function getGravitationalWavesPreview() {
    const data = getGravitationalWavesData();
    const latest = data.events[0];
    return {
        totalEvents: data.count,
        observingRun: data.observingRun,
        latestEvent: latest.eventName,
        latestSNR: latest.signalToNoise,
    };
}
