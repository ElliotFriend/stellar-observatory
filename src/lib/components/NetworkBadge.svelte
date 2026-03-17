<script lang="ts">
	let { network }: { network: string } = $props();

	const isTestnet = $derived(network.includes('testnet'));
	const label = $derived(isTestnet ? 'Testnet' : 'Pubnet');
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {isTestnet
		? 'bg-solar-400/20 text-solar-400'
		: 'bg-aurora-400/20 text-aurora-400'}"
>
	<span class="mr-1.5 h-1.5 w-1.5 rounded-full {isTestnet ? 'bg-solar-400' : 'bg-aurora-400'}"></span>
	{label}
</span>
