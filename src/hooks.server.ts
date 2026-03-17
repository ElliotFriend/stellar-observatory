import { sequence } from '@sveltejs/kit/hooks';
import { paymentHookFromConfig } from 'x402-sveltekit';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import type { Network } from '@x402/core/types';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { endpoints } from '$lib/config/endpoints.js';

const network = (publicEnv.PUBLIC_STELLAR_NETWORK ?? 'stellar:testnet') as Network;
const payTo = env.PAYTO_ADDRESS ?? 'GDNB6ZWJ4HV5EMJYPJNTHTEMUJVFOHZX6VJE34KZGWKF4UQDJ7UCEQIO';
const facilitatorUrl = env.FACILITATOR_URL ?? 'https://x402.org/facilitator';

const routes = Object.fromEntries(
	endpoints.map((ep) => [
		`GET ${ep.path}`,
		{
			accepts: [{ scheme: 'exact' as const, network, payTo, price: ep.price }],
			description: ep.description
		}
	])
);

const registerExactStellarScheme = (server: { register: (network: Network, scheme: ExactStellarScheme) => unknown }) => {
	server.register('stellar:*', new ExactStellarScheme());
};

const x402Handle = paymentHookFromConfig({
	facilitatorUrl,
	schemes: [{ register: registerExactStellarScheme }],
	routes
});

export const handle = sequence(x402Handle);
