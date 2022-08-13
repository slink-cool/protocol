import type { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type { WalletAdapter } from './wallet-adapter';

export class NodeWalletAdapter implements WalletAdapter {
  constructor(private readonly keypair: Keypair) {}

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.keypair);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.keypair);
      return t;
    });
  }
}
