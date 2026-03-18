<script lang="ts">
    import PriceTag from '$lib/components/PriceTag.svelte';
    import DataViewer from '$lib/components/DataViewer.svelte';
    import PaymentResult from '$lib/components/PaymentResult.svelte';
    import { getWalletState } from '$lib/wallet/store.svelte.js';
    import { page } from '$app/stores';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
    const endpoint = $derived(data.endpoint);

    const wallet = getWalletState();
    const network = $derived($page.data.network ?? 'stellar:testnet');

    let responseData = $state<unknown>(null);
    let loading = $state(false);
    let fetchError = $state<string | null>(null);
    let txHash = $state<string | null>(null);

    async function fetchData() {
        if (!wallet.paidFetch) {
            fetchError = 'Please connect your wallet first';
            return;
        }

        loading = true;
        fetchError = null;
        responseData = null;
        txHash = null;

        try {
            const res = await wallet.paidFetch(endpoint.path);
            if (!res.ok) {
                throw new Error(`Request failed: ${res.status} ${res.statusText}`);
            }

            const settleHeader = res.headers.get('x-payment-response');
            if (settleHeader) {
                try {
                    const settle = JSON.parse(atob(settleHeader));
                    txHash = settle.txHash ?? null;
                } catch {
                    // Settle header parse failed, not critical
                }
            }

            responseData = await res.json();
        } catch (err) {
            fetchError = err instanceof Error ? err.message : String(err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="mx-auto max-w-4xl px-4 py-12">
    <a
        href="/"
        class="mb-6 inline-flex items-center text-sm text-slate-400 transition-colors hover:text-nebula-400"
    >
        &larr; Back to all endpoints
    </a>

    <div class="mb-8">
        <div class="mb-3 flex items-center gap-4">
            <span class="text-4xl">{endpoint.icon}</span>
            <div>
                <h2 class="text-3xl font-bold text-white">
                    {endpoint.slug
                        .split('-')
                        .map((w: string) => w[0].toUpperCase() + w.slice(1))
                        .join(' ')}
                </h2>
                <p class="text-slate-400">{endpoint.description}</p>
            </div>
        </div>

        <div class="mt-4 flex items-center gap-4">
            <PriceTag price={endpoint.price} />
            <code class="rounded bg-space-700 px-2 py-1 text-xs text-slate-400">
                GET {endpoint.path}
            </code>
        </div>
    </div>

    <div class="mb-6 flex items-center gap-4">
        <button
            onclick={fetchData}
            disabled={loading || !wallet.connected}
            class="rounded-lg bg-nebula-600 px-6 py-2.5 text-sm font-medium text-white transition-all
				hover:bg-nebula-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {#if loading}
                <span class="inline-flex items-center">
                    <span
                        class="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"
                    ></span>
                    Processing payment...
                </span>
            {:else}
                Fetch Data ({endpoint.price})
            {/if}
        </button>

        {#if !wallet.connected}
            <p class="text-sm text-slate-500">Connect your wallet to make requests</p>
        {/if}
    </div>

    <PaymentResult {txHash} {network} />

    <div class="mt-4">
        <DataViewer data={responseData} {loading} error={fetchError} />
    </div>
</div>
