<script lang="ts">
	let { txHash = null, network }: { txHash?: string | null; network: string } = $props();

	const explorerBase = $derived(
		network.includes('testnet')
			? 'https://stellar.expert/explorer/testnet/tx/'
			: 'https://stellar.expert/explorer/public/tx/'
	);
</script>

{#if txHash}
	<div class="rounded-lg bg-aurora-500/10 border border-aurora-500/30 p-4">
		<p class="text-sm text-aurora-400 font-medium mb-1">Payment successful!</p>
		<p class="text-xs text-slate-400">
			Tx: <a
				href="{explorerBase}{txHash}"
				target="_blank"
				rel="noopener noreferrer"
				class="text-stellar-400 hover:underline"
			>
				{txHash.slice(0, 8)}...{txHash.slice(-8)}
			</a>
		</p>
	</div>
{/if}
