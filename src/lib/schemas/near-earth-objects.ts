import { z, Timestamp } from './common';

export const NearEarthObject = z
    .object({
        name: z.string(),
        estimatedDiameter: z
            .object({
                min: z.number(),
                best: z.number(),
                max: z.number(),
            })
            .describe('meters'),
        isHazardous: z.boolean(),
        closeApproachDate: z.string(),
        missDistance: z.object({
            astronomical: z.number(),
            kilometers: z.number(),
        }),
        relativeVelocity: z.number().describe('km/s'),
        orbitClass: z.string(),
    })
    .openapi('NearEarthObject');

export const NearEarthObjectsData = z
    .object({
        objects: z.array(NearEarthObject),
        count: z.number().int(),
        queryPeriod: z.object({
            start: z.string().describe('YYYY-MM-DD'),
            end: z.string().describe('YYYY-MM-DD'),
        }),
        timestamp: Timestamp,
    })
    .openapi('NearEarthObjectsData');
