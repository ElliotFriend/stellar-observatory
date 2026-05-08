export interface ServiceInfoOptions {
    payTo: string;
}

export function buildServiceInfo({ payTo }: ServiceInfoOptions) {
    return {
        name: 'stellar-observatory',
        description: 'Paid astronomy data endpoints (x402 / MPP) on Stellar.',
        payTo,
        networks: ['stellar:pubnet', 'stellar:testnet'] as const,
    };
}

export const SERVICE_TITLE = 'Stellar Observatory API';
export const SERVICE_DESCRIPTION =
    'Paid astronomy data endpoints. Supports x402 today and MPP discovery via OpenAPI 3.1 extensions.';
