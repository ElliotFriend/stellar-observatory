import { sequence } from "@sveltejs/kit/hooks"
import { paymentHookFromConfig } from 'x402-sveltekit'
import { ExactStellarScheme } from '@x402/stellar/exact/server'
// import { registerExactEvmScheme } from "@x402/evm/exact/server"
import { x402ResourceServer } from "@x402/core/server"
import type { Network } from "@x402/core/types"

interface StellarResourceServerConfig {
    networks?: Network[]
}

const registerExactStellarScheme = (server: x402ResourceServer, config?: StellarResourceServerConfig): x402ResourceServer => {
    if (config?.networks && config.networks.length > 0) {
        config.networks.forEach(network => {
            server.register(network, new ExactStellarScheme())
        })
    } else {
        server.register('stellar:*', new ExactStellarScheme())
    }
    return server
}

const x402Handle = paymentHookFromConfig({
    facilitatorUrl: 'https://x402.org/facilitator',
    schemes: [
        // { register: registerExactEvmScheme },
        { register: registerExactStellarScheme },
        // { register: new ExactStellarScheme() },
    ],
    routes: {
        'GET /api/premium': {
            accepts: [
                {
                    scheme: 'exact',
                    network: 'stellar:testnet',
                    payTo: 'GDNB6ZWJ4HV5EMJYPJNTHTEMUJVFOHZX6VJE34KZGWKF4UQDJ7UCEQIO',
                    price: '$0.01',
                }
            ],
            description: 'Premium API endpoint',
        },
    },
});

export const handle = sequence(x402Handle)
