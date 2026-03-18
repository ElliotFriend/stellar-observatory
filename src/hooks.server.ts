import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import {
    create402Response,
    extractPaymentPayload,
    SvelteKitAdapter,
    verifyAndBuildPaymentInfo,
    handleSettlement,
    ErrorMessages,
} from 'x402-sveltekit';
import { ExactStellarScheme } from '@x402/stellar/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/http';
import { x402ResourceServer } from '@x402/core/server';
import type { Network } from '@x402/core/types';
import { env } from '$env/dynamic/private';
import { endpoints } from '$lib/config/endpoints';
import { NETWORK_COOKIE_NAME, getNetworkFromCookie } from '$lib/config/network';

const payTo = env.PAYTO_ADDRESS;
const facilitatorUrl = env.FACILITATOR_URL;
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

const initPromise = resourceServer.initialize().catch((err) => {
    console.error('Failed to initialize x402 resource server:', err);
});

const dynamicRoutes = new Map(
    endpoints.map((ep) => [
        ep.path,
        {
            accepts: (event: { cookies: { get: (name: string) => string | undefined } }) => {
                const network = getNetworkFromCookie(
                    event.cookies.get(NETWORK_COOKIE_NAME),
                ) as Network;
                return [{ scheme: 'exact' as const, network, payTo, price: ep.price }];
            },
            description: ep.description,
        },
    ]),
);

// Custom dynamic route handler that properly awaits async createPaymentRequiredResponse.
// This works around a bug in x402-sveltekit@0.1.8 where the library doesn't await
// the (now-async) createPaymentRequiredResponse from @x402/core@2.7.0.
const x402Handle: Handle = async ({ event, resolve }) => {
    if (event.request.method !== 'GET') return resolve(event);

    const dynamicConfig = dynamicRoutes.get(event.url.pathname);
    if (!dynamicConfig) return resolve(event);

    await initPromise;

    const clonedRequest = event.request.clone();
    const eventForAccepts = new Proxy(event, {
        get(target, prop) {
            if (prop === 'request') return clonedRequest;
            return Reflect.get(target, prop);
        },
    });

    const paymentOptions = await dynamicConfig.accepts(eventForAccepts);
    if (paymentOptions === null || paymentOptions.length === 0) {
        return resolve(event);
    }

    const adapter = new SvelteKitAdapter(event);
    const requirements = await resourceServer.buildPaymentRequirementsFromOptions(paymentOptions, {
        adapter,
        path: event.url.pathname,
        method: event.request.method,
    });

    const resourceInfo = {
        url: event.url.href,
        description: dynamicConfig.description ?? '',
        mimeType: 'application/json',
    };

    let paymentPayload;
    try {
        paymentPayload = extractPaymentPayload(event);
    } catch {
        return create402Response(
            await resourceServer.createPaymentRequiredResponse(
                requirements,
                resourceInfo,
                ErrorMessages.INVALID_SIGNATURE_HEADER,
            ),
        );
    }

    if (!paymentPayload) {
        return create402Response(
            await resourceServer.createPaymentRequiredResponse(requirements, resourceInfo),
        );
    }

    const result = await verifyAndBuildPaymentInfo(
        resourceServer,
        paymentPayload,
        requirements,
        resourceInfo,
    );

    if (!result.ok) {
        return result.response;
    }

    const paymentInfo = { ...result.paymentInfo };
    event.locals.x402 = paymentInfo;

    const response = await resolve(event);
    if (response.status >= 200 && response.status < 300) {
        return handleSettlement(
            resourceServer,
            paymentPayload,
            result.matchedReq,
            response,
            paymentInfo,
            console,
        );
    }

    return response;
};

const bypassHandle: Handle = async ({ event, resolve }) => {
    if (bypassSecret && event.url.searchParams.get('bypass') === bypassSecret) {
        return resolve(event);
    }
    return x402Handle({ event, resolve });
};

export const handle = sequence(bypassHandle);
