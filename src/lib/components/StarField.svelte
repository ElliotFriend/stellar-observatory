<script lang="ts">
	const stars = Array.from({ length: 80 }, (_, i) => ({
		id: i,
		left: Math.random() * 100,
		top: Math.random() * 100,
		size: Math.random() * 2 + 1,
		delay: Math.random() * 4,
		duration: Math.random() * 3 + 2
	}));
</script>

<div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
	{#each stars as star (star.id)}
		<div
			class="absolute rounded-full bg-white animate-pulse"
			style="left: {star.left}%; top: {star.top}%; width: {star.size}px; height: {star.size}px; animation-delay: {star.delay}s; animation-duration: {star.duration}s; opacity: {star.size / 3};"
		></div>
	{/each}
</div>
