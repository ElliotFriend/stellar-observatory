<script lang="ts">
    import './layout.css';
    import Header from '$lib/components/Header.svelte';
    import StarField from '$lib/components/StarField.svelte';
    import { getNetworkPassphrase, type StellarNetwork } from '$lib/config/network';
    import { onMount } from 'svelte';

    let { children, data } = $props();

    const network = $derived(data.network as StellarNetwork);
    const networkPassphrase = $derived(getNetworkPassphrase(network));

    onMount(async () => {
        const { StellarWalletsKit } = await import('@creit-tech/stellar-wallets-kit');
        const { Networks } = await import('@creit-tech/stellar-wallets-kit/types');
        const { FreighterModule } =
            await import('@creit-tech/stellar-wallets-kit/modules/freighter');

        StellarWalletsKit.init({
            modules: [new FreighterModule()],
            network: network.includes('testnet') ? Networks.TESTNET : Networks.PUBLIC,
        });
    });
</script>

<svelte:head>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <title>Stellar Observatory - x402 Payment Demo</title>
</svelte:head>

<StarField />

<div class="relative flex min-h-screen flex-col">
    <Header {network} {networkPassphrase} />
    <main class="flex-1">
        {@render children()}
    </main>
    <footer class="border-t border-space-600/50 py-4 text-center text-xs text-slate-600">
        Powered by x402 protocol &middot; Stellar Network
    </footer>
</div>
