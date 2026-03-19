<script lang="ts">
    import { onMount } from 'svelte';
    import { resolve } from '$app/paths';
    import type { LayoutProps } from './$types';

    import Header from '$lib/components/Header.svelte';
    import StarField from '$lib/components/StarField.svelte';

    import './layout.css';

    let { children, data }: LayoutProps = $props();
    const { network } = $derived(data);

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
    <Header />
    <main class="flex-1">
        {@render children()}
    </main>
    <footer class="border-t border-space-600/50 py-4 text-center text-xs text-slate-600">
        Powered by <a
            href="https://x402.org"
            target="_blank"
            class="text-nebula-400 transition-colors hover:text-white">x402</a
        >
        protocol &middot;
        <a
            href="https://www.stellar.org"
            target="_blank"
            class="text-stellar-400 transition-colors hover:text-white">Stellar</a
        >
        Network &middot;
        <a
            href="https://github.com/elliotfriend/stellar-observer"
            target="_blank"
            class="text-slate-400 transition-colors hover:text-white">Source Code</a
        >
        &middot;
        <a href={resolve('/attributions')} class="text-slate-400 transition-colors hover:text-white"
            >Attributions</a
        >
    </footer>
</div>
