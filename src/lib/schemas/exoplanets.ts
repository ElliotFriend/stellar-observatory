import { z, Timestamp } from './common';

export const Exoplanet = z
    .object({
        name: z.string().openapi({ example: 'Kepler-442b' }),
        hostStar: z.string(),
        distanceLightYears: z.number().nullable(),
        orbitalPeriod: z.number().describe('days'),
        mass: z.number().describe('Earth masses'),
        radius: z.number().describe('Earth radii'),
        equilibriumTemp: z.number().describe('Kelvin'),
        discoveryMethod: z.string(),
        discoveryYear: z.number().int(),
        habitabilityScore: z.number().min(0).max(1),
        atmosphere: z.string().nullable(),
    })
    .openapi('Exoplanet');

export const ExoplanetsData = z
    .object({
        planets: z.array(Exoplanet),
        count: z.number().int(),
        timestamp: Timestamp,
    })
    .openapi('ExoplanetsData');
