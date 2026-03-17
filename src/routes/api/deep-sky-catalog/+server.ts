import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDeepSkyCatalogData } from '$lib/data/deep-sky-catalog.js';

export const GET: RequestHandler = () => {
	return json(getDeepSkyCatalogData());
};
