import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSpaceWeatherData } from '$lib/data/space-weather.js';

export const GET: RequestHandler = () => {
    return json(getSpaceWeatherData());
};
