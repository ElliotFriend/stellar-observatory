import type { z } from 'zod';

const SHOULD_VALIDATE = !import.meta.env.PROD;

// Validates a 2xx JSON response against `schema` in dev/test. Throws on mismatch
// so drift between a handler and its declared OpenAPI shape fails loudly. No-op
// in production. Assumes a fully-buffered `json(...)` response — not safe for
// streamed bodies.
type AnyHandler = (event: never) => Response | Promise<Response>;

export function withResponseSchema<H extends AnyHandler>(schema: z.ZodTypeAny, handler: H): H {
    if (!SHOULD_VALIDATE) return handler;

    const wrapped = (async (event: Parameters<H>[0]) => {
        const res = await handler(event);
        if (!res.ok) return res;

        const contentType = res.headers.get('content-type') ?? '';
        if (!contentType.includes('json')) return res;

        const body = await res.clone().json();
        schema.parse(body);
        return res;
    }) as H;

    return wrapped;
}
