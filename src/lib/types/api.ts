export interface SpaceWeatherData {
    solarWind: {
        speed: number; // km/s
        density: number; // protons/cm³
        temperature: number; // Kelvin
        magneticField: { bx: number; by: number; bz: number }; // nT
    };
    geomagneticStorms: Array<{
        id: string;
        kpIndex: number; // 0-9
        severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
        startTime: string;
        estimatedEndTime: string;
    }>;
    solarFlares: Array<{
        id: string;
        class: string; // e.g. "X1.5", "M3.2"
        region: number;
        peakTime: string;
        duration: number; // minutes
    }>;
    auroraForecast: {
        northernHemisphere: { latitude: number; probability: number }[];
        southernHemisphere: { latitude: number; probability: number }[];
    };
    timestamp: string;
}

export interface NearEarthObject {
    id: string;
    name: string;
    designation: string;
    estimatedDiameter: { min: number; max: number }; // meters
    isHazardous: boolean;
    closeApproachDate: string;
    missDistance: { astronomical: number; kilometers: number };
    relativeVelocity: number; // km/s
    orbitClass: string;
}

export interface NearEarthObjectsData {
    objects: NearEarthObject[];
    count: number;
    queryPeriod: { start: string; end: string };
    timestamp: string;
}

export interface Exoplanet {
    id: string;
    name: string;
    hostStar: string;
    distanceLightYears: number;
    orbitalPeriod: number; // days
    mass: number; // Earth masses
    radius: number; // Earth radii
    equilibriumTemp: number; // Kelvin
    discoveryMethod: string;
    discoveryYear: number;
    habitabilityScore: number; // 0-1
    atmosphere: string | null;
}

export interface ExoplanetsData {
    planets: Exoplanet[];
    count: number;
    timestamp: string;
}

export interface DeepSkyObject {
    id: string;
    name: string;
    catalogDesignation: string; // e.g. "NGC 224", "M31"
    type: 'galaxy' | 'nebula' | 'cluster' | 'supernova-remnant' | 'not-found' | 'star';
    constellation: string;
    rightAscension: string;
    declination: string;
    apparentMagnitude: number;
    imagingRecommendation: {
        minAperture: number; // mm
        idealExposure: number; // seconds
        bestMonths: string[];
        filterSuggestion: string;
    };
}

export interface DeepSkyCatalogData {
    objects: DeepSkyObject[];
    count: number;
    timestamp: string;
}

export interface GravitationalWaveEvent {
    id: string;
    eventName: string;
    detectionTime: string;
    source: 'binary-black-hole' | 'binary-neutron-star' | 'neutron-star-black-hole' | 'unknown';
    estimatedDistance: number; // megaparsecs
    signalToNoise: number;
    chirpMass: number; // solar masses
    skyLocalization: { ra: string; dec: string; errorRadius: number }; // degrees
    detectors: string[];
    confidence: number; // 0-1
}

export interface GravitationalWavesData {
    events: GravitationalWaveEvent[];
    count: number;
    observingRun: string;
    timestamp: string;
}

export interface EndpointConfig {
    slug: string;
    path: string;
    price: string;
    description: string;
    previewDescription: string;
    icon: string;
}

export type ApiResponse =
    | SpaceWeatherData
    | NearEarthObjectsData
    | ExoplanetsData
    | DeepSkyCatalogData
    | GravitationalWavesData;
