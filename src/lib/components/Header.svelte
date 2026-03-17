<script lang="ts">
    import WalletButton from './WalletButton.svelte';
    import NetworkBadge from './NetworkBadge.svelte';
    import type { Network } from '@x402/core/types';

    let { network, networkPassphrase }: { network: Network; networkPassphrase: string } = $props();
</script>

<header class="sticky top-0 z-50 border-b border-space-600/50 bg-space-900/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="/" class="flex items-center gap-3">
            <span class="text-2xl">&#x1F52D;</span>
            <div>
                <h1 class="text-lg font-bold text-white">Stellar Observatory</h1>
                <p class="text-xs text-slate-500">x402 Payment Demo</p>
            </div>
        </a>

        <div class="flex items-center gap-3">
            <NetworkBadge {network} />
            <WalletButton {network} {networkPassphrase} />
        </div>
    </div>
</header>
