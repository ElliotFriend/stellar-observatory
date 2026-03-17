import { error } from '@sveltejs/kit';
import { getEndpointBySlug } from '$lib/config/endpoints.js';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const endpoint = getEndpointBySlug(params.endpoint);
	if (!endpoint) {
		error(404, { message: `Endpoint "${params.endpoint}" not found` });
	}
	return { endpoint };
};
