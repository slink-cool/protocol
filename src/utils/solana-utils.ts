import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export async function fundKeypair(
  publicKey: PublicKey,
  connection: Connection,
) {
  const airDropRequest = await connection.requestAirdrop(
    publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airDropRequest);
}
