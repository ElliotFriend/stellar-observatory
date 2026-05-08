import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { buildOpenApiDocument } from '$lib/openapi/build';

let cached: ReturnType<typeof buildOpenApiDocument> | undefined;

function getDocument(baseUrl: string) {
    if (!cached) {
        cached = buildOpenApiDocument({
            baseUrl,
            payTo: env.PAYTO_ADDRESS ?? 'GA__UNCONFIGURED',
        });
    }
    return cached;
}

export const GET: RequestHandler = ({ url }) => {
    return json(getDocument(url.origin));
};
