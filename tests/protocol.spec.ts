import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Delink } from '../target/types/delink';

describe('Protocol', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Delink as Program<Delink>;

  test('Can create object profile', async () => {
    // given
    const object = Keypair.generate();
    const [objectProfile, objectProfileBump] =
      await PublicKey.findProgramAddress(
        [utf8.encode('object_profile'), object.publicKey.toBuffer()],
        program.programId,
      );
    console.log(objectProfileBump);
    // when
    await program.methods
      .createObjectProfile(object.publicKey)
      .accounts({
        objectProfile,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    // then
    const account = await program.account.objectProfile.fetch(objectProfile);
    console.log(account);
    expect(account.objectAddress.toBase58()).toBe(object.publicKey.toBase58());
    expect(account.bump).toBe(objectProfileBump);
  });
});
