<script lang="ts">
    import EndpointCard from '$lib/components/EndpointCard.svelte';
    import { endpoints } from '$lib/config/endpoints.js';
    import { getSpaceWeatherPreview } from '$lib/data/space-weather.js';
    import { getNearEarthObjectsPreview } from '$lib/data/near-earth-objects.js';
    import { getExoplanetsPreview } from '$lib/data/exoplanets.js';
    import { getDeepSkyCatalogPreview } from '$lib/data/deep-sky-catalog.js';
    import { getGravitationalWavesPreview } from '$lib/data/gravitational-waves.js';

    const previews: Record<string, Record<string, unknown>> = {
        'space-weather': getSpaceWeatherPreview(),
        'near-earth-objects': getNearEarthObjectsPreview(),
        exoplanets: getExoplanetsPreview(),
        'deep-sky-catalog': getDeepSkyCatalogPreview(),
        'gravitational-waves': getGravitationalWavesPreview(),
    };
</script>

<div class="mx-auto max-w-6xl px-4 py-12">
    <div class="mb-12 text-center">
        <h2 class="mb-4 text-4xl font-bold text-white">Explore the Cosmos</h2>
        <p class="mx-auto max-w-2xl text-lg text-slate-400">
            Access premium astronomical data through x402 micropayments on the Stellar network.
            Connect your wallet and pay per request — no subscriptions, no API keys.
        </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each endpoints as endpoint (endpoint.slug)}
            <EndpointCard {endpoint} preview={previews[endpoint.slug]} />
        {/each}
    </div>

    <div
        class="mt-16 rounded-xl border border-space-600/50 bg-space-800/50 p-8 text-center backdrop-blur-sm"
    >
        <h3 class="mb-3 text-xl font-semibold text-white">How It Works</h3>
        <div class="mx-auto grid max-w-3xl gap-6 md:grid-cols-3">
            <div>
                <div class="mb-2 text-2xl">1&#xFE0F;&#x20E3;</div>
                <p class="text-sm text-slate-400">
                    Connect your Stellar wallet (Freighter, xBull, etc.)
                </p>
            </div>
            <div>
                <div class="mb-2 text-2xl">2&#xFE0F;&#x20E3;</div>
                <p class="text-sm text-slate-400">
                    Browse endpoints and click "Fetch Data" to pay the listed price
                </p>
            </div>
            <div>
                <div class="mb-2 text-2xl">3&#xFE0F;&#x20E3;</div>
                <p class="text-sm text-slate-400">
                    Your wallet signs the payment and you get instant access to the data
                </p>
            </div>
        </div>
    </div>
</div>
