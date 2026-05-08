import { z, Timestamp } from './common';

export const DeepSkyObjectType = z
    .enum(['galaxy', 'nebula', 'cluster', 'supernova-remnant', 'not-found', 'star'])
    .openapi('DeepSkyObjectType');

export const ImagingRecommendation = z
    .object({
        minAperture: z.number().describe('mm'),
        idealExposure: z.number().describe('seconds'),
        bestMonths: z.array(z.string()),
        filterSuggestion: z.string(),
    })
    .openapi('ImagingRecommendation');

export const DeepSkyObject = z
    .object({
        id: z.string(),
        name: z.string(),
        catalogDesignation: z.string().openapi({ example: 'M31 / NGC 224' }),
        type: DeepSkyObjectType,
        constellation: z.string(),
        rightAscension: z.string(),
        declination: z.string(),
        apparentMagnitude: z.number(),
        imagingRecommendation: ImagingRecommendation,
    })
    .openapi('DeepSkyObject');

export const DeepSkyCatalogData = z
    .object({
        objects: z.array(DeepSkyObject),
        count: z.number().int(),
        timestamp: Timestamp,
    })
    .openapi('DeepSkyCatalogData');
