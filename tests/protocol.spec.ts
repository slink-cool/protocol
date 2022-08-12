import type { Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import { Keypair, PublicKey } from '@solana/web3.js';
import type { Delink } from '../target/types/delink';
import {
  createObjectProfile,
  createObjectProfileAttachment,
  createObjectRelationAttachment,
  createObjectsRelation,
} from '../src/api';
import { decode, encode } from '../src/utils';

describe('Protocol', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Delink as Program<Delink>;

  test('Can create object profile', async () => {
    // given / when
    const { objectKeypair, objectProfilePda } = await createObjectProfile(
      Keypair.generate(),
      program,
    );
    // then
    const account = await program.account.objectProfile.fetch(objectProfilePda);
    expect(account.objectAddress.toBase58()).toBe(
      objectKeypair.publicKey.toBase58(),
    );
  });

  test('Can add single attachment to profile', async () => {
    // given
    const { objectKeypair, objectProfilePda } = await createObjectProfile(
      Keypair.generate(),
      program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const profileAttachmentPda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
      program,
    );
    const attachmentPda = await program.account.attachment.fetch(
      profileAttachmentPda,
    );
    const profileAfter = await program.account.objectProfile.fetch(
      objectProfilePda,
    );
    // then
    expect(attachmentPda.index).toBe(0);
    expect(attachmentPda.entityAddress.toBase58()).toBe(
      objectProfilePda.toBase58(),
    );
    expect(profileAfter.nextAttachmentIndex).toBe(1);
  });

  test('Can add multiple attachments to profile', async () => {
    // given
    const { objectProfilePda, objectKeypair } = await createObjectProfile(
      Keypair.generate(),
      program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const attachment1Pda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
      program,
    );
    const attachment2Pda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
      program,
    );
    const attachment1 = await program.account.attachment.fetch(attachment1Pda);
    const attachment2 = await program.account.attachment.fetch(attachment2Pda);
    const profileAfter = await program.account.objectProfile.fetch(
      objectProfilePda,
    );
    // then
    expect(attachment1Pda.toBase58()).not.toBe(attachment2Pda.toBase58());
    expect(attachment1.index).toBe(0);
    expect(attachment2.index).toBe(1);
    expect(profileAfter.nextAttachmentIndex).toBe(2);
  });

  test('Can create objects relation', async () => {
    // given
    const {
      objectProfilePda: objectAProfilePda,
      objectKeypair: objectAKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    // when
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
      program,
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
    const {
      objectProfilePda: objectAProfilePda,
      objectKeypair: objectAKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
      program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const objectsRelationAttachmentPda = await createObjectRelationAttachment(
      objectsRelationPda,
      objectAKeypair,
      encode(uri),
      sha256,
      program,
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
    const {
      objectProfilePda: objectAProfilePda,
      objectKeypair: objectAKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const { objectProfilePda: objectBProfilePda } = await createObjectProfile(
      Keypair.generate(),
      program,
    );
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
      program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const objectsRelationAttachment1Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      objectAKeypair,
      encode(uri),
      sha256,
      program,
    );
    const objectsRelationAttachment2Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      objectAKeypair,
      encode(uri),
      sha256,
      program,
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

  test('Can do attachment acknowledgement', async () => {
    // given
    const {
      objectProfilePda: objectAProfilePda,
      objectKeypair: objectAKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile(Keypair.generate(), program);
    const { objectProfilePda: objectOrgProfilePda } = await createObjectProfile(
      Keypair.generate(),
      program,
    );
    const objectsRelationAOrgPda = await createObjectsRelation(
      objectAProfilePda,
      objectOrgProfilePda,
      objectAKeypair,
      program,
    );
    const objectsRelationBOrgPda = await createObjectsRelation(
      objectBProfilePda,
      objectOrgProfilePda,
      objectBKeypair,
      program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const attachmentPda = await createObjectProfileAttachment(
      objectAProfilePda,
      objectAKeypair,
      encode(uri),
      sha256,
      program,
    );
    const attachment = await program.account.attachment.fetch(attachmentPda);

    console.log(attachment.sha256Hash);
    console.log(decode(attachment.uri));
    const [acknowledgementPda] = await PublicKey.findProgramAddress(
      [utf8.encode('acknowledgement'), attachmentPda.toBuffer()],
      program.programId,
    );
    await program.methods
      .createAcknowledgment(objectAProfilePda, attachment.index)
      .accounts({
        objectsRelationAc: objectsRelationAOrgPda,
        objectsRelationBc: objectsRelationBOrgPda,
        objectProfileAttachment: attachmentPda,
        acknowledgement: acknowledgementPda,
        creator: objectBKeypair.publicKey,
      })
      .signers([objectBKeypair])
      .rpc();
    const acknowledgement = await program.account.acknowledgment.fetch(
      acknowledgementPda,
    );
    // then
    expect(acknowledgement.index).toBe(0);
    expect(acknowledgement.entityAddress.toBase58()).toBe(
      attachmentPda.toBase58(),
    );
  });
});
