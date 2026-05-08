import { describe, it, expect } from 'vitest';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { withResponseSchema } from '$lib/openapi/validate';

const schema = z.object({ ok: z.boolean(), n: z.number() });
const event = {} as unknown as Parameters<RequestHandler>[0];

describe('withResponseSchema', () => {
    it('passes responses that match the schema through unchanged', async () => {
        const handler: RequestHandler = async () => json({ ok: true, n: 1 });
        const wrapped = withResponseSchema(schema, handler);

        const res = await wrapped(event);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ ok: true, n: 1 });
    });

    it('throws when the response body fails the schema', async () => {
        const handler: RequestHandler = async () =>
            json({ ok: 'not-a-bool', n: 1 } as unknown as object);
        const wrapped = withResponseSchema(schema, handler);

        await expect(wrapped(event)).rejects.toThrow();
    });

    it('does not validate non-2xx responses', async () => {
        const handler: RequestHandler = async () => json({ error: 'bad' }, { status: 400 });
        const wrapped = withResponseSchema(schema, handler);

        const res = await wrapped(event);
        expect(res.status).toBe(400);
    });

    it('does not validate non-JSON responses', async () => {
        const handler: RequestHandler = async () =>
            new Response('hello', { headers: { 'content-type': 'text/plain' } });
        const wrapped = withResponseSchema(schema, handler);

        const res = await wrapped(event);
        expect(await res.text()).toBe('hello');
    });

    it('does not consume the response body (downstream can still read it)', async () => {
        const handler: RequestHandler = async () => json({ ok: true, n: 42 });
        const wrapped = withResponseSchema(schema, handler);

        const res = await wrapped(event);
        const body = await res.json();
        expect(body).toEqual({ ok: true, n: 42 });
    });
});
