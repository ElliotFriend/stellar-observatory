import type { StellarNetwork } from '$lib/config/network';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            x402?: Record<string, unknown>;
        }
        interface PageData {
            network: StellarNetwork;
            rpcUrl?: string;
        }
        // interface PageState {}
        // interface Platform {}
    }
}

export {};
