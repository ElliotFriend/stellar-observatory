<script lang="ts">
    import { resolve } from '$app/paths';
    import type { EndpointConfig } from '$lib/types/api';

    import PriceTag from '$lib/components/PriceTag.svelte';

    interface Props {
        endpoint: EndpointConfig;
        preview?: Record<string, unknown>;
    }
    let { endpoint, preview }: Props = $props();
</script>

<a
    href={resolve('/explore/[endpoint]', { endpoint: endpoint.slug })}
    class="group relative block rounded-xl border border-space-600/50 bg-space-800/80 p-6 backdrop-blur-sm transition-all hover:border-nebula-500/50 hover:shadow-lg hover:shadow-nebula-500/10"
>
    <div class="mb-3 flex items-center justify-between">
        <span class="text-2xl">{endpoint.icon}</span>
        <PriceTag price={endpoint.price} />
    </div>

    <h3 class="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-nebula-400">
        {endpoint.slug
            .split('-')
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(' ')}
    </h3>

    <p class="mb-4 text-sm text-slate-400">
        {endpoint.description}
    </p>

    {#if preview}
        <div class="rounded-lg bg-space-900/60 p-3 text-xs">
            <p class="mb-1 font-medium text-stellar-400">Preview</p>
            <div class="space-y-1 text-slate-400">
                {#each Object.entries(preview) as [key, value] (key)}
                    <div class="flex justify-between">
                        <span class="text-slate-500">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span class="text-slate-300"
                            >{typeof value === 'number' ? value.toLocaleString() : value}</span
                        >
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <div class="mt-4 text-xs text-nebula-400 opacity-0 transition-opacity group-hover:opacity-100">
        Explore &rarr;
    </div>
</a>
