import { z, Timestamp } from './common';

export const SolarWind = z
    .object({
        speed: z.number().describe('km/s'),
        density: z.number().describe('protons/cm³'),
        temperature: z.number().describe('Kelvin'),
        magneticField: z
            .object({
                bx: z.number(),
                by: z.number(),
                bz: z.number(),
            })
            .describe('nT'),
    })
    .openapi('SolarWind');

export const GeomagneticStorm = z
    .object({
        kpIndex: z.number().min(0).max(9),
        severity: z.enum(['minor', 'moderate', 'strong', 'severe', 'extreme']),
        timeTag: z.string(),
    })
    .openapi('GeomagneticStorm');

export const SolarFlare = z
    .object({
        sourceSatellite: z.number().int(),
        class: z.string().describe('Flare class, e.g. "X1.5", "M3.2"'),
        peakTime: z.string(),
        duration: z.number().describe('minutes'),
    })
    .openapi('SolarFlare');

export const AuroraForecast = z
    .object({
        northernHemisphere: z.array(
            z.object({ latitude: z.number(), probability: z.number().min(0).max(1) }),
        ),
        southernHemisphere: z.array(
            z.object({ latitude: z.number(), probability: z.number().min(0).max(1) }),
        ),
    })
    .openapi('AuroraForecast');

export const SpaceWeatherData = z
    .object({
        solarWind: SolarWind.nullable(),
        geomagneticStorms: z.array(GeomagneticStorm),
        solarFlares: z.array(SolarFlare),
        auroraForecast: AuroraForecast,
        timestamp: Timestamp,
    })
    .openapi('SpaceWeatherData');
