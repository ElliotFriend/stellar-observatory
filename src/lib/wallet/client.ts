import { x402Client, x402HTTPClient } from '@x402/core/client';
import { ExactStellarScheme } from '@x402/stellar';
import type { ClientStellarSigner } from '@x402/stellar';
import type { Network } from '@x402/core/types';

/**
 * Creates a fetch wrapper that handles x402 402 Payment Required responses.
 * On a 402, it extracts payment requirements, creates a payment payload via
 * the wallet signer, and retries the request with the payment header.
 */
export function createPaidFetch(signer: ClientStellarSigner, network: Network, rpcUrl?: string) {
    const rpcConfig = rpcUrl ? { url: rpcUrl } : undefined;
    const client = new x402Client().register(network, new ExactStellarScheme(signer, rpcConfig));
    const httpClient = new x402HTTPClient(client);

    return async (url: string, init?: RequestInit): Promise<Response> => {
        const res = await fetch(url, init);
        if (res.status !== 402) return res;

        const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
            res.headers.get(name),
        );

        const hookHeaders = await httpClient.handlePaymentRequired(paymentRequired);
        if (hookHeaders) {
            return fetch(url, { ...init, headers: { ...init?.headers, ...hookHeaders } });
        }

        const payload = await httpClient.createPaymentPayload(paymentRequired);
        const headers = httpClient.encodePaymentSignatureHeader(payload);

        return fetch(url, { ...init, headers: { ...init?.headers, ...headers } });
    };
}
