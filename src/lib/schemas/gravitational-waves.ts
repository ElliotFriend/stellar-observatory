import { z, Timestamp } from './common';

export const GravitationalWaveEvent = z
    .object({
        id: z.string(),
        eventName: z.string(),
        detectionTime: z.string(),
        source: z
            .string()
            .describe('Source class, e.g. "binary-black-hole", "binary-neutron-star".'),
        estimatedDistance: z.number().describe('megaparsecs'),
        signalToNoise: z.number(),
        chirpMass: z.number().describe('solar masses'),
        detectors: z.array(z.string()),
        confidence: z.number().min(0).max(1),
    })
    .openapi('GravitationalWaveEvent');

export const GravitationalWavesData = z
    .object({
        events: z.array(GravitationalWaveEvent),
        count: z.number().int(),
        observingRun: z.string().openapi({ example: 'O5' }),
        timestamp: Timestamp,
    })
    .openapi('GravitationalWavesData');
