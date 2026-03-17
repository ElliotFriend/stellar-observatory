<script lang="ts">
	let { data, loading = false, error = null }: {
		data: unknown;
		loading?: boolean;
		error?: string | null;
	} = $props();
</script>

<div class="rounded-xl border border-space-600/50 bg-space-800/80 p-6 backdrop-blur-sm">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="h-8 w-8 animate-spin rounded-full border-2 border-nebula-500 border-t-transparent"></div>
			<span class="ml-3 text-slate-400">Fetching data...</span>
		</div>
	{:else if error}
		<div class="rounded-lg bg-red-500/10 border border-red-500/30 p-4">
			<p class="text-sm text-red-400">{error}</p>
		</div>
	{:else if data}
		<pre class="overflow-auto rounded-lg bg-space-900 p-4 text-xs text-slate-300 max-h-96">{JSON.stringify(data, null, 2)}</pre>
	{:else}
		<p class="py-12 text-center text-slate-500">Connect your wallet and pay to view full data</p>
	{/if}
</div>
