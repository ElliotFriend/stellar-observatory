<script lang="ts">
	import { getWalletState, connectWallet, disconnectWallet } from '$lib/wallet/store.svelte.js';
	import type { Network } from '@x402/core/types';

	let { network, networkPassphrase }: { network: Network; networkPassphrase: string } = $props();

	const wallet = getWalletState();

	function handleClick() {
		if (wallet.connected) {
			disconnectWallet();
		} else {
			connectWallet(network, networkPassphrase);
		}
	}
</script>

<button
	onclick={handleClick}
	disabled={wallet.loading}
	class="rounded-lg px-4 py-2 text-sm font-medium transition-all
		{wallet.connected
			? 'bg-space-700 text-slate-300 hover:bg-space-600 border border-space-600'
			: 'bg-nebula-600 text-white hover:bg-nebula-500'}
		disabled:opacity-50 disabled:cursor-not-allowed"
>
	{#if wallet.loading}
		<span class="inline-flex items-center">
			<span class="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
			Connecting...
		</span>
	{:else if wallet.connected}
		{wallet.address?.slice(0, 4)}...{wallet.address?.slice(-4)}
	{:else}
		Connect Wallet
	{/if}
</button>

{#if wallet.error}
	<p class="mt-1 text-xs text-red-400">{wallet.error}</p>
{/if}
