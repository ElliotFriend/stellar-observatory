<script lang="ts">
    import { page } from '$app/state';

    let { network } = $derived(page.data);
    let { txHash = null }: { txHash?: string | null } = $props();

    const explorerBase = $derived(
        network.includes('testnet')
            ? 'https://stellar.expert/explorer/testnet/tx/'
            : 'https://stellar.expert/explorer/public/tx/',
    );
</script>

{#if txHash}
    <div class="rounded-lg border border-aurora-500/30 bg-aurora-500/10 p-4">
        <p class="mb-1 text-sm font-medium text-aurora-400">Payment successful!</p>
        <p class="text-xs text-slate-400">
            Tx: <a
                href="{explorerBase}{txHash}"
                target="_blank"
                rel="external noopener noreferrer"
                class="text-stellar-400 hover:underline"
            >
                {txHash.slice(0, 8)}...{txHash.slice(-8)}
            </a>
        </p>
    </div>
{/if}
