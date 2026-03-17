import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getNearEarthObjectsData } from '$lib/data/near-earth-objects.js';

export const GET: RequestHandler = () => {
    return json(getNearEarthObjectsData());
};
