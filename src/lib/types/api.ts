import type { z } from 'zod';
import type {
    SolarWind as SolarWindSchema,
    GeomagneticStorm as GeomagneticStormSchema,
    SolarFlare as SolarFlareSchema,
    AuroraForecast as AuroraForecastSchema,
    SpaceWeatherData as SpaceWeatherDataSchema,
    NearEarthObject as NearEarthObjectSchema,
    NearEarthObjectsData as NearEarthObjectsDataSchema,
    Exoplanet as ExoplanetSchema,
    ExoplanetsData as ExoplanetsDataSchema,
    DeepSkyObject as DeepSkyObjectSchema,
    DeepSkyCatalogData as DeepSkyCatalogDataSchema,
    GravitationalWaveEvent as GravitationalWaveEventSchema,
    GravitationalWavesData as GravitationalWavesDataSchema,
} from '$lib/schemas';

export type SolarWind = z.infer<typeof SolarWindSchema>;
export type GeomagneticStorm = z.infer<typeof GeomagneticStormSchema>;
export type SolarFlare = z.infer<typeof SolarFlareSchema>;
export type AuroraForecast = z.infer<typeof AuroraForecastSchema>;
export type SpaceWeatherData = z.infer<typeof SpaceWeatherDataSchema>;

export type NearEarthObject = z.infer<typeof NearEarthObjectSchema>;
export type NearEarthObjectsData = z.infer<typeof NearEarthObjectsDataSchema>;

export type Exoplanet = z.infer<typeof ExoplanetSchema>;
export type ExoplanetsData = z.infer<typeof ExoplanetsDataSchema>;

export type DeepSkyObject = z.infer<typeof DeepSkyObjectSchema>;
export type DeepSkyCatalogData = z.infer<typeof DeepSkyCatalogDataSchema>;

export type GravitationalWaveEvent = z.infer<typeof GravitationalWaveEventSchema>;
export type GravitationalWavesData = z.infer<typeof GravitationalWavesDataSchema>;

export interface EndpointConfig {
    slug: string;
    path: string;
    method: 'GET';
    price: string;
    description: string;
    previewDescription: string;
    icon: string;
    summary?: string;
    tags?: string[];
    responseSchema: z.ZodTypeAny;
}

export type ApiResponse =
    | SpaceWeatherData
    | NearEarthObjectsData
    | ExoplanetsData
    | DeepSkyCatalogData
    | GravitationalWavesData;
