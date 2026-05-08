import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export { z };

export const Timestamp = z.string().datetime().openapi({
    description: 'ISO 8601 timestamp.',
    example: '2025-03-15T12:00:00Z',
});

export const Network = z.enum(['stellar:testnet', 'stellar:pubnet']).openapi('Network');

// RFC 9457 problem+json
export const ErrorResponse = z
    .object({
        type: z.string().optional(),
        title: z.string(),
        status: z.number().int(),
        detail: z.string().optional(),
        instance: z.string().optional(),
    })
    .openapi('ErrorResponse');
