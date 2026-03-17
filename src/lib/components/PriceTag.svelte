<script lang="ts">
	let { price }: { price: string } = $props();
</script>

<span class="inline-flex items-center rounded-full bg-nebula-500/20 px-2.5 py-0.5 text-xs font-medium text-nebula-400">
	{price}
</span>
