import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Token } from '../target/types/token';

describe('game', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Token as Program<Token>;

  it('Create token', async () => {
    // Add your test here.
    const token = Keypair.generate();

    const [tokenPDA, _] = await PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode('token'), token.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .create(token.publicKey)
      .accounts({
        token: tokenPDA,
        owner: provider.wallet.publicKey,
        createKey: token.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    let acc = await program.account.token.fetch(tokenPDA);
    let info = await program.account.token.getAccountInfo(tokenPDA);
    console.log(acc);
    console.log(info);
  });

  it('Assign token to user', async () => {
    const token = Keypair.generate();
    const user = Keypair.generate();

    const [userTokenPda, _] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user-token'),
        provider.wallet.publicKey.toBuffer(),
        user.publicKey.toBuffer(),
        token.publicKey.toBuffer(),
      ],
      program.programId,
    );

    await program.methods
      .createUserToken(228)
      .accounts({
        owner: provider.wallet.publicKey,
        token: token.publicKey,
        user: user.publicKey,
        userToken: userTokenPda,
      })
      .rpc();

    const account = await program.account.userToken.fetch(userTokenPda);
    const info = await program.account.userToken.getAccountInfo(userTokenPda);
    console.log(account);
    console.log(info);
  });
});
