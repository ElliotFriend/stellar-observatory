<script lang="ts">
    import { disconnectWallet } from '$lib/wallet/store.svelte';

    let { network }: { network: string } = $props();

    const isTestnet = $derived(network.includes('testnet'));
    const label = $derived(isTestnet ? 'Testnet' : 'Mainnet');
    const oppositeNetwork = $derived(isTestnet ? 'stellar:pubnet' : 'stellar:testnet');

    let switching = $state(false);

    async function toggleNetwork() {
        if (switching) return;
        switching = true;

        try {
            await disconnectWallet();
            const res = await fetch('/api/network', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ network: oppositeNetwork }),
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch {
            switching = false;
        }
    }
</script>

<button
    onclick={toggleNetwork}
    disabled={switching}
    class="inline-flex cursor-pointer items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-wait {isTestnet
        ? 'bg-solar-400/20 text-solar-400'
        : 'bg-aurora-400/20 text-aurora-400'}"
    title="Switch to {isTestnet ? 'Mainnet' : 'Testnet'}"
>
    <span class="mr-1.5 h-1.5 w-1.5 rounded-full {isTestnet ? 'bg-solar-400' : 'bg-aurora-400'}"
    ></span>
    {label}
    <svg class="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
        <path
            fill-rule="evenodd"
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
            clip-rule="evenodd"
        />
    </svg>
</button>
