import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { NETWORK_COOKIE_NAME, type StellarNetwork } from '$lib/config/network';

const VALID_NETWORKS: StellarNetwork[] = ['stellar:testnet', 'stellar:pubnet'];

export const POST: RequestHandler = async ({ request, cookies }) => {
    const body = await request.json();
    const network = body.network as StellarNetwork;

    if (!network || !VALID_NETWORKS.includes(network)) {
        return json({ error: 'Invalid network. Must be "stellar:testnet" or "stellar:pubnet".' }, { status: 400 });
    }

    cookies.set(NETWORK_COOKIE_NAME, network, {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 365,
    });

    return json({ network });
};
