import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSignAuthEntry = vi.fn();
const mockSignTransaction = vi.fn();

vi.mock('@creit-tech/stellar-wallets-kit', () => ({
    StellarWalletsKit: {
        signAuthEntry: mockSignAuthEntry,
        signTransaction: mockSignTransaction,
    },
}));

import { createWalletKitSigner } from '$lib/wallet/adapter';

describe('createWalletKitSigner', () => {
    const address = 'GABC123';
    const passphrase = 'Test SDF Network ; September 2015';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a signer with the correct address', () => {
        const signer = createWalletKitSigner(address, passphrase);
        expect(signer.address).toBe(address);
    });

    it('signAuthEntry delegates to StellarWalletsKit', async () => {
        mockSignAuthEntry.mockResolvedValue({
            signedAuthEntry: 'signed-auth-entry-xdr',
        });

        const signer = createWalletKitSigner(address, passphrase);
        const result = await signer.signAuthEntry('auth-entry-xdr');

        expect(mockSignAuthEntry).toHaveBeenCalledWith('auth-entry-xdr', {
            address,
            networkPassphrase: passphrase,
        });
        expect(result.signedAuthEntry).toBe('signed-auth-entry-xdr');
    });

    it('signAuthEntry uses opts override for networkPassphrase', async () => {
        mockSignAuthEntry.mockResolvedValue({
            signedAuthEntry: 'signed',
        });

        const signer = createWalletKitSigner(address, passphrase);
        await signer.signAuthEntry('entry', { networkPassphrase: 'custom-passphrase' });

        expect(mockSignAuthEntry).toHaveBeenCalledWith('entry', {
            address,
            networkPassphrase: 'custom-passphrase',
        });
    });

    it('signTransaction delegates to StellarWalletsKit', async () => {
        mockSignTransaction.mockResolvedValue({
            signedTxXdr: 'signed-tx-xdr',
        });

        const signer = createWalletKitSigner(address, passphrase);
        const result = await signer.signTransaction!('tx-xdr');

        expect(mockSignTransaction).toHaveBeenCalledWith('tx-xdr', {
            address,
            networkPassphrase: passphrase,
        });
        expect(result.signedTxXdr).toBe('signed-tx-xdr');
    });
});
