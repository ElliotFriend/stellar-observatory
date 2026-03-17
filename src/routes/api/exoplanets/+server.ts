import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getExoplanetsData } from '$lib/data/exoplanets.js';

export const GET: RequestHandler = () => {
    return json(getExoplanetsData());
};
