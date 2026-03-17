import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@x402/core/client', () => {
    class MockX402Client {
        register() {
            return this;
        }
    }
    class MockX402HTTPClient {
        getPaymentRequiredResponse = vi.fn();
        handlePaymentRequired = vi.fn().mockResolvedValue(null);
        createPaymentPayload = vi.fn();
        encodePaymentSignatureHeader = vi.fn();
    }
    return { x402Client: MockX402Client, x402HTTPClient: MockX402HTTPClient };
});

vi.mock('@x402/stellar', () => ({
    ExactStellarScheme: vi.fn(),
    createEd25519Signer: vi.fn().mockReturnValue({
        address: 'GABC123',
        signAuthEntry: vi.fn(),
    }),
}));

import { createMcpX402Client, paidFetch } from '../src/x402-client.js';

describe('MCP x402 client', () => {
    it('createMcpX402Client returns an x402HTTPClient', () => {
        const client = createMcpX402Client('STEST123', 'stellar:testnet');
        expect(client).toBeDefined();
        expect(typeof client.getPaymentRequiredResponse).toBe('function');
    });

    describe('paidFetch', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('returns response directly for non-402', async () => {
            vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({ ok: true }), { status: 200 }),
            );

            const client = createMcpX402Client('STEST123', 'stellar:testnet');
            const res = await paidFetch(client, 'https://example.com/api/test');

            expect(res.status).toBe(200);
            expect(fetch).toHaveBeenCalledTimes(1);
        });
    });
});
