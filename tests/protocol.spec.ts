import type { Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import type { Delink } from '../target/types/delink';

describe('Protocol', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Delink as Program<Delink>;

  test('Can create object profile', async () => {
    // given / when
    const { objectKeypair, objectProfilePda } = await createObjectProfile();
    // then
    const account = await program.account.objectProfile.fetch(objectProfilePda);
    expect(account.objectAddress.toBase58()).toBe(
      objectKeypair.publicKey.toBase58(),
    );
  });

  test('Can create objects relation', async () => {
    // given
    const { objectProfilePda: objectAProfilePda } = await createObjectProfile();
    const { objectProfilePda: objectBProfilePda } = await createObjectProfile();
    // when
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
    );
    // then
    const account = await program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    expect(account.objectAProfileAddress.toBase58()).toBe(
      objectAProfilePda.toBase58(),
    );
    expect(account.objectBProfileAddress.toBase58()).toBe(
      objectBProfilePda.toBase58(),
    );
    expect(account.nextAttachmentIndex).toBe(0);
  });

  test('Can add single attachment to objects relation', async () => {
    // given
    const { objectProfilePda: objectAProfilePda } = await createObjectProfile();
    const { objectProfilePda: objectBProfilePda } = await createObjectProfile();
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
    );
    // when
    const objectsRelationAttachmentPda = await createAttachment(
      objectsRelationPda,
    );
    const attachment = await program.account.attachment.fetch(
      objectsRelationAttachmentPda,
    );
    const relationAfter = await program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    // then
    expect(attachment.index).toBe(0);
    expect(attachment.entityAddress.toBase58()).toBe(
      objectsRelationPda.toBase58(),
    );
    expect(relationAfter.nextAttachmentIndex).toBe(1);
  });

  test('Can add multiple attachments to objects relation', async () => {
    // given
    const { objectProfilePda: objectAProfilePda } = await createObjectProfile();
    const { objectProfilePda: objectBProfilePda } = await createObjectProfile();
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
    );
    const objectsRelationAttachment1Pda = await createAttachment(
      objectsRelationPda,
    );
    const objectsRelationAttachment2Pda = await createAttachment(
      objectsRelationPda,
    );
    const attachment1 = await program.account.attachment.fetch(
      objectsRelationAttachment1Pda,
    );
    const attachment2 = await program.account.attachment.fetch(
      objectsRelationAttachment2Pda,
    );
    const relationAfter = await program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    // then
    expect(objectsRelationAttachment1Pda.toBase58()).not.toBe(
      objectsRelationAttachment2Pda.toBase58(),
    );
    expect(attachment1.index).toBe(0);
    expect(attachment2.index).toBe(1);
    expect(relationAfter.nextAttachmentIndex).toBe(2);
  });

  async function fundKeypair(publicKey: PublicKey) {
    const connection = program.provider.connection;
    const airDropRequest = await connection.requestAirdrop(
      publicKey,
      10 * LAMPORTS_PER_SOL,
    );
    await connection.confirmTransaction(airDropRequest);
  }

  async function createObjectProfile() {
    const objectKeypair = Keypair.generate();
    await fundKeypair(objectKeypair.publicKey);
    const [objectProfilePda] = await PublicKey.findProgramAddress(
      [utf8.encode('object_profile'), objectKeypair.publicKey.toBuffer()],
      program.programId,
    );
    await program.methods
      .createObjectProfile(objectKeypair.publicKey)
      .accounts({
        objectProfile: objectProfilePda,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    return { objectKeypair, objectProfilePda };
  }

  async function createObjectsRelation(
    objectAProfilePda: PublicKey,
    objectBProfilePda: PublicKey,
  ) {
    const [objectsRelationPda] = await PublicKey.findProgramAddress(
      [
        utf8.encode('objects_relation'),
        objectAProfilePda.toBytes(),
        objectBProfilePda.toBytes(),
      ],
      program.programId,
    );
    await program.methods
      .createObjectsRelation()
      .accounts({
        objectAProfile: objectAProfilePda,
        objectBProfile: objectBProfilePda,
        objectsRelation: objectsRelationPda,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    return objectsRelationPda;
  }

  async function createAttachment(objectsRelationPda: PublicKey) {
    const relationBefore = await program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    const nextAttachmentIndex = relationBefore.nextAttachmentIndex;
    const [objectsRelationAttachmentPda] = await PublicKey.findProgramAddress(
      [
        utf8.encode('objects_relation_attachment'),
        objectsRelationPda.toBuffer(),
        new anchor.BN(nextAttachmentIndex).toArrayLike(Buffer),
      ],
      program.programId,
    );
    await program.methods
      .createObjectsRelationAttachment()
      .accounts({
        objectsRelation: objectsRelationPda,
        objectsRelationAttachment: objectsRelationAttachmentPda,
        creator: provider.wallet.publicKey,
      })
      .rpc();
    return objectsRelationAttachmentPda;
  }
});
