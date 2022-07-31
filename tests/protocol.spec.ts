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
    expect(account.objectAddress.toBase58()).toBe(object.publicKey.toBase58());
    expect(account.bump).toBe(objectProfileBump);
  });

  test('Can create objects relation', async () => {
    // given
    const objectA = Keypair.generate();
    const [objectAProfile] = await PublicKey.findProgramAddress(
      [utf8.encode('object_profile'), objectA.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .createObjectProfile(objectA.publicKey)
      .accounts({
        objectProfile: objectAProfile,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    const objectB = Keypair.generate();
    const [objectBProfile] = await PublicKey.findProgramAddress(
      [utf8.encode('object_profile'), objectB.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .createObjectProfile(objectB.publicKey)
      .accounts({
        objectProfile: objectBProfile,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    // when
    const [objectsRelation] = await PublicKey.findProgramAddress(
      [
        utf8.encode('objects_relation'),
        objectAProfile.toBytes(),
        objectBProfile.toBytes(),
      ],
      program.programId,
    );
    await program.methods
      .createObjectsRelation()
      .accounts({
        objectAProfile,
        objectBProfile,
        objectsRelation,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    // then
    const account = await program.account.objectsRelation.fetch(
      objectsRelation,
    );
    expect(account.objectAProfileAddress.toBase58()).toBe(
      objectAProfile.toBase58(),
    );
    expect(account.objectBProfileAddress.toBase58()).toBe(
      objectBProfile.toBase58(),
    );
  });
});
