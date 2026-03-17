import { x402Client, x402HTTPClient } from '@x402/core/client';
import { ExactStellarScheme } from '@x402/stellar';
import { createEd25519Signer } from '@x402/stellar';
import type { Network } from '@x402/core/types';

export function createMcpX402Client(secretKey: string, network: Network): x402HTTPClient {
    const signer = createEd25519Signer(secretKey, network);
    const client = new x402Client().register(network, new ExactStellarScheme(signer));
    return new x402HTTPClient(client);
}

export async function paidFetch(
    httpClient: x402HTTPClient,
    url: string,
    init?: RequestInit,
): Promise<Response> {
    const res = await fetch(url, init);
    if (res.status !== 402) return res;

    const paymentRequired = httpClient.getPaymentRequiredResponse((name) => res.headers.get(name));

    const hookHeaders = await httpClient.handlePaymentRequired(paymentRequired);
    if (hookHeaders) {
        return fetch(url, { ...init, headers: { ...init?.headers, ...hookHeaders } });
    }

    const payload = await httpClient.createPaymentPayload(paymentRequired);
    const headers = httpClient.encodePaymentSignatureHeader(payload);

    return fetch(url, { ...init, headers: { ...init?.headers, ...headers } });
}
