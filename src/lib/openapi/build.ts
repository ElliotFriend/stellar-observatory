import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { apiRoutes, type ApiRoute } from '$lib/config/endpoints';
import { ErrorResponse } from '$lib/schemas';
import {
    SERVICE_DESCRIPTION,
    SERVICE_TITLE,
    buildServiceInfo,
    type ServiceInfoOptions,
} from './registry';

const SERVICE_VERSION = '0.0.1';

export interface BuildOpenApiOptions extends ServiceInfoOptions {
    baseUrl: string;
}

function paymentInfoFor(route: ApiRoute) {
    if (!route.price) return undefined;
    return {
        offers: [
            {
                intent: 'charge',
                method: 'x402',
                amount: route.price,
                currency: 'USD',
                description: route.description,
            },
        ],
    };
}

export function buildOpenApiDocument(opts: BuildOpenApiOptions) {
    const registry = new OpenAPIRegistry();

    for (const route of apiRoutes) {
        const responses: Record<string, { description: string; content: object }> = {
            200: {
                description: 'OK',
                content: {
                    'application/json': { schema: route.responseSchema },
                },
            },
        };

        if (route.price) {
            responses[402] = {
                description: 'Payment required',
                content: {
                    'application/problem+json': { schema: ErrorResponse },
                },
            };
        }

        const xPaymentInfo = paymentInfoFor(route);

        registry.registerPath({
            method: route.method.toLowerCase() as 'get' | 'post',
            path: route.path,
            summary: route.summary,
            description: route.description,
            tags: route.tags,
            request: route.requestSchema
                ? {
                      body: {
                          required: true,
                          content: {
                              'application/json': { schema: route.requestSchema },
                          },
                      },
                  }
                : undefined,
            responses,
            ...(xPaymentInfo && { 'x-payment-info': xPaymentInfo }),
        });
    }

    const generator = new OpenApiGeneratorV31(registry.definitions);
    const generated = generator.generateDocument({
        openapi: '3.1.0',
        info: {
            title: SERVICE_TITLE,
            version: SERVICE_VERSION,
            description: SERVICE_DESCRIPTION,
        },
        servers: [{ url: opts.baseUrl }],
    });

    // Explicit key order — generator emits components before paths and an empty
    // webhooks object; reshape to the conventional layout.
    const { paths, components, webhooks, ...rest } = generated;
    return {
        ...rest,
        ...(paths && { paths }),
        ...(components && { components }),
        ...(webhooks && Object.keys(webhooks).length > 0 && { webhooks }),
        'x-service-info': buildServiceInfo({ payTo: opts.payTo }),
    };
}
