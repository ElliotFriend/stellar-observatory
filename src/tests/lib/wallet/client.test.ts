import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreatePaymentPayload = vi.fn();
const mockEncodePaymentSignatureHeader = vi.fn();
const mockGetPaymentRequiredResponse = vi.fn();
const mockHandlePaymentRequired = vi.fn();

vi.mock('@x402/core/client', () => {
	class MockX402Client {
		register() { return this; }
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
	ExactStellarScheme: vi.fn()
}));

import { createPaidFetch } from '$lib/wallet/client.js';
import type { ClientStellarSigner } from '@x402/stellar';

describe('createPaidFetch', () => {
	const mockSigner: ClientStellarSigner = {
		address: 'GABC123',
		signAuthEntry: vi.fn()
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockHandlePaymentRequired.mockResolvedValue(null);
	});

	it('returns response directly for non-402 status', async () => {
		const mockResponse = new Response(JSON.stringify({ data: 'test' }), { status: 200 });
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(mockResponse);

		const paidFetch = createPaidFetch(mockSigner, 'stellar:testnet');
		const result = await paidFetch('https://example.com/api/data');

		expect(result.status).toBe(200);
		expect(mockCreatePaymentPayload).not.toHaveBeenCalled();
	});

	it('handles 402 by creating payment and retrying', async () => {
		const headers402 = new Headers({ 'x-payment': 'required' });
		const response402 = new Response('Payment Required', { status: 402, headers: headers402 });
		const response200 = new Response(JSON.stringify({ data: 'paid' }), { status: 200 });

		vi.spyOn(globalThis, 'fetch')
			.mockResolvedValueOnce(response402)
			.mockResolvedValueOnce(response200);

		mockGetPaymentRequiredResponse.mockReturnValue({ some: 'requirements' });
		mockCreatePaymentPayload.mockResolvedValue({ payload: 'test' });
		mockEncodePaymentSignatureHeader.mockReturnValue({ 'X-Payment': 'signed' });

		const paidFetch = createPaidFetch(mockSigner, 'stellar:testnet');
		const result = await paidFetch('https://example.com/api/data');

		expect(result.status).toBe(200);
		expect(mockGetPaymentRequiredResponse).toHaveBeenCalled();
		expect(mockCreatePaymentPayload).toHaveBeenCalledWith({ some: 'requirements' });
		expect(fetch).toHaveBeenCalledTimes(2);
	});
});
