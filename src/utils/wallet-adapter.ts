import type { SignerWalletAdapterProps } from '@solana/wallet-adapter-base/lib/types/signer';
import type { PublicKey } from '@solana/web3.js';

export interface WalletAdapter {
  publicKey?: PublicKey;
  signTransaction?: SignerWalletAdapterProps['signTransaction'];
  signAllTransactions?: SignerWalletAdapterProps['signAllTransactions'];
}
