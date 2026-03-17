import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGravitationalWavesData } from '$lib/data/gravitational-waves.js';

export const GET: RequestHandler = () => {
	return json(getGravitationalWavesData());
};
