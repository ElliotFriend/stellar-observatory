import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { paymentHook } from 'x402-sveltekit';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/http';
import { x402ResourceServer } from '@x402/core/server';
import type { Network } from '@x402/core/types';
import { env } from '$env/dynamic/private';
import { endpoints } from '$lib/config/endpoints';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie } from '$lib/config/network';

const payTo = env.PAYTO_ADDRESS ?? 'GDNB6ZWJ4HV5EMJYPJNTHTEMUJVFOHZX6VJE34KZGWKF4UQDJ7UCEQIO';
const facilitatorUrl = env.FACILITATOR_URL ?? 'https://x402.org/facilitator';
const facilitatorApiKey = env.FACILITATOR_API_KEY;
const bypassSecret = env.BYPASS_PAYMENT_SECRET;

const facilitatorClient = new HTTPFacilitatorClient({
    url: facilitatorUrl,
    ...(facilitatorApiKey && {
        createAuthHeaders: async () => {
            const bearer = { Authorization: `Bearer ${facilitatorApiKey}` };
            return { verify: bearer, settle: bearer, supported: bearer };
        },
    }),
});

const resourceServer = new x402ResourceServer(facilitatorClient);
resourceServer.register('stellar:*', new ExactStellarScheme());

const routes = Object.fromEntries(
    endpoints.map((ep) => [
        `GET ${ep.path}`,
        {
            accepts: (event: { cookies: { get: (name: string) => string | undefined } }) => {
                const network = getNetworkFromCookie(event.cookies.get(NETWORK_COOKIE_NAME)) as Network;
                return [{ scheme: 'exact' as const, network, payTo, price: ep.price }];
            },
            description: ep.description,
        },
    ]),
);

const x402Handle = paymentHook({
    resourceServer,
    routes,
});

const bypassHandle: Handle = async ({ event, resolve }) => {
    if (bypassSecret && event.url.searchParams.get('bypass') === bypassSecret) {
        return resolve(event);
    }
    return x402Handle({ event, resolve });
};

export const handle = sequence(bypassHandle);
