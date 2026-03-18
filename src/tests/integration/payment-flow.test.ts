import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetPaymentRequiredResponse = vi.fn();
const mockHandlePaymentRequired = vi.fn().mockResolvedValue(null);
const mockCreatePaymentPayload = vi.fn();
const mockEncodePaymentSignatureHeader = vi.fn();

vi.mock('@x402/core/client', () => {
    class MockX402Client {
        register() {
            return this;
        }
    }
    class MockX402HTTPClient {
        getPaymentRequiredResponse = mockGetPaymentRequiredResponse;
        handlePaymentRequired = mockHandlePaymentRequired;
        createPaymentPayload = mockCreatePaymentPayload;
        encodePaymentSignatureHeader = mockEncodePaymentSignatureHeader;
    }
    return { x402Client: MockX402Client, x402HTTPClient: MockX402HTTPClient };
});

vi.mock('@x402/stellar', () => ({
    ExactStellarScheme: vi.fn(),
}));

import { createPaidFetch } from '$lib/wallet/client';
import { endpoints } from '$lib/config/endpoints';

describe('payment flow integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockHandlePaymentRequired.mockResolvedValue(null);
    });

    it('complete 402 → pay → receive data flow for each endpoint', async () => {
        const mockSigner = { address: 'GTEST', signAuthEntry: vi.fn() };

        for (const ep of endpoints) {
            const mockData = { endpoint: ep.slug, data: 'test' };
            const headers402 = new Headers({ 'x-payment-required': 'test' });

            vi.spyOn(globalThis, 'fetch')
                .mockResolvedValueOnce(new Response('', { status: 402, headers: headers402 }))
                .mockResolvedValueOnce(new Response(JSON.stringify(mockData), { status: 200 }));

            mockGetPaymentRequiredResponse.mockReturnValue({
                accepts: [
                    {
                        scheme: 'exact',
                        network: 'stellar:testnet',
                        payTo: 'GTEST',
                        price: ep.price,
                    },
                ],
            });
            mockCreatePaymentPayload.mockResolvedValue({ payload: 'signed' });
            mockEncodePaymentSignatureHeader.mockReturnValue({ 'X-Payment': 'signed-header' });

            const paidFetch = createPaidFetch(mockSigner, 'stellar:testnet');
            const res = await paidFetch(`http://localhost:5173${ep.path}`);

            expect(res.status).toBe(200);
            const data = await res.json();
            expect(data.endpoint).toBe(ep.slug);

            vi.restoreAllMocks();
        }
    });

    it('passes through non-402 responses without payment', async () => {
        const mockSigner = { address: 'GTEST', signAuthEntry: vi.fn() };
        const mockData = { status: 'ok' };

        vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
            new Response(JSON.stringify(mockData), { status: 200 }),
        );

        const paidFetch = createPaidFetch(mockSigner, 'stellar:testnet');
        const res = await paidFetch('http://localhost:5173/api/space-weather');

        expect(res.status).toBe(200);
        expect(mockCreatePaymentPayload).not.toHaveBeenCalled();
    });
});
