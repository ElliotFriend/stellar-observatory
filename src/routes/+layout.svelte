<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import StarField from '$lib/components/StarField.svelte';
	import { env } from '$env/dynamic/public';
	import { getNetworkPassphrase, type StellarNetwork } from '$lib/config/network.js';
	import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
	import { Networks } from '@creit-tech/stellar-wallets-kit/types';
	import { FreighterModule } from '@creit-tech/stellar-wallets-kit/modules/freighter';

	let { children } = $props();

	const network = (env.PUBLIC_STELLAR_NETWORK ?? 'stellar:testnet') as StellarNetwork;
	const networkPassphrase = getNetworkPassphrase(network);

	StellarWalletsKit.init({
		modules: [new FreighterModule()],
		network: network.includes('testnet') ? Networks.TESTNET : Networks.PUBLIC,
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Stellar Observatory - x402 Payment Demo</title>
</svelte:head>

<StarField />

<div class="relative min-h-screen flex flex-col">
	<Header {network} {networkPassphrase} />
	<main class="flex-1">
		{@render children()}
	</main>
	<footer class="border-t border-space-600/50 py-4 text-center text-xs text-slate-600">
		Powered by x402 protocol &middot; Stellar Network
	</footer>
</div>
