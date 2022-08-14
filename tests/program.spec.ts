import * as anchor from '@project-serum/anchor';
import { AnchorProvider, Program, setProvider } from '@project-serum/anchor';
import { Keypair } from '@solana/web3.js';
import type { Slink } from '../target/types/slink';
import { IDL } from '../target/types/slink';
import {
  acknowledgeAttachment,
  createObjectProfile,
  createObjectProfileAttachment,
  createObjectRelationAttachment,
  createObjectsRelation,
} from '../src/program/program-api';
import { decode, encode, fundKeypair } from '../src/utils/utils';
import { NodeWalletAdapter } from '../src/utils/node-wallet-adapter';

describe('Protocol', () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const anchorProgram = anchor.workspace.Slink as Program<Slink>;

  test('Can create object profile', async () => {
    // given / when
    const { publicKey, program } = await createObject();
    const { objectProfilePda } = await createObjectProfile(program);
    // then
    const account = await anchorProgram.account.objectProfile.fetch(
      objectProfilePda,
    );
    expect(account.objectAddress.toBase58()).toBe(publicKey.toBase58());
    expect(account.authority.toBase58()).toBe(publicKey.toBase58());
  });

  test('Can add single attachment to profile', async () => {
    // given
    const { program } = await createObject();
    const { objectProfilePda } = await createObjectProfile(program);
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const profileAttachmentPda = await createObjectProfileAttachment(
      objectProfilePda,
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
    const { program } = await createObject();
    const { objectProfilePda } = await createObjectProfile(program);
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const attachment1Pda = await createObjectProfileAttachment(
      objectProfilePda,
      encode(uri),
      sha256,
      program,
    );
    const attachment2Pda = await createObjectProfileAttachment(
      objectProfilePda,
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
    const { program: object1Program } = await createObject();
    const { objectProfilePda: object1ProfilePda } = await createObjectProfile(
      object1Program,
    );
    const { program: object2Program } = await createObject();
    const { objectProfilePda: object2ProfilePda } = await createObjectProfile(
      object2Program,
    );
    // when
    const objectsRelationPda = await createObjectsRelation(
      object1ProfilePda,
      object2ProfilePda,
      object1Program,
    );
    // then
    const account = await object1Program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    expect(account.objectAProfileAddress.toBase58()).toBe(
      object1ProfilePda.toBase58(),
    );
    expect(account.objectBProfileAddress.toBase58()).toBe(
      object2ProfilePda.toBase58(),
    );
    expect(account.nextAttachmentIndex).toBe(0);
  });

  test('Can add single attachment to objects relation', async () => {
    // given
    const { program: object1Program } = await createObject();
    const { objectProfilePda: object1ProfilePda } = await createObjectProfile(
      object1Program,
    );
    const { program: object2Program } = await createObject();
    const { objectProfilePda: object2ProfilePda } = await createObjectProfile(
      object2Program,
    );
    const objectsRelationPda = await createObjectsRelation(
      object1ProfilePda,
      object2ProfilePda,
      object1Program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const objectsRelationAttachmentPda = await createObjectRelationAttachment(
      objectsRelationPda,
      encode(uri),
      sha256,
      object1Program,
    );
    const attachment = await object1Program.account.attachment.fetch(
      objectsRelationAttachmentPda,
    );
    const relationAfter = await object1Program.account.objectsRelation.fetch(
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
    const { program: object1Program } = await createObject();
    const { objectProfilePda: object1ProfilePda } = await createObjectProfile(
      object1Program,
    );
    const { program: object2Program } = await createObject();
    const { objectProfilePda: object2ProfilePda } = await createObjectProfile(
      object2Program,
    );
    const objectsRelationPda = await createObjectsRelation(
      object1ProfilePda,
      object2ProfilePda,
      object1Program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const objectsRelationAttachment1Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      encode(uri),
      sha256,
      object1Program,
    );
    const objectsRelationAttachment2Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      encode(uri),
      sha256,
      object1Program,
    );
    const attachment1 = await object1Program.account.attachment.fetch(
      objectsRelationAttachment1Pda,
    );
    const attachment2 = await object1Program.account.attachment.fetch(
      objectsRelationAttachment2Pda,
    );
    const relationAfter = await object1Program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    // then
    expect(objectsRelationAttachment1Pda.toBase58()).not.toBe(
      objectsRelationAttachment2Pda.toBase58(),
    );
    expect(decode(attachment1.uri)).toBe(uri);
    expect(decode(attachment2.uri)).toBe(uri);
    expect(attachment1.index).toBe(0);
    expect(attachment2.index).toBe(1);
    expect(relationAfter.nextAttachmentIndex).toBe(2);
  });

  test('Can do attachment acknowledgement', async () => {
    // given
    const { program: object1Program } = await createObject();
    const { objectProfilePda: object1ProfilePda } = await createObjectProfile(
      object1Program,
    );
    const { program: object2Program, publicKey: object2PublicKey } =
      await createObject();
    const { objectProfilePda: object2ProfilePda } = await createObjectProfile(
      object2Program,
    );
    const { program: object3Program } = await createObject();
    const { objectProfilePda: object3ProfilePda } = await createObjectProfile(
      object3Program,
    );
    const objectsRelationAOrgPda = await createObjectsRelation(
      object1ProfilePda,
      object3ProfilePda,
      object1Program,
    );
    const objectsRelationBOrgPda = await createObjectsRelation(
      object2ProfilePda,
      object3ProfilePda,
      object2Program,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const attachmentPda = await createObjectProfileAttachment(
      object1ProfilePda,
      encode(uri),
      sha256,
      object1Program,
    );
    const acknowledgementPda = await acknowledgeAttachment(
      attachmentPda,
      objectsRelationAOrgPda,
      objectsRelationBOrgPda,
      object2PublicKey,
      object2Program,
    );
    const acknowledgement = await object1Program.account.acknowledgment.fetch(
      acknowledgementPda,
    );
    // then
    expect(acknowledgement.index).toBe(0);
    expect(acknowledgement.entityAddress.toBase58()).toBe(
      attachmentPda.toBase58(),
    );
  });

  async function createObject() {
    const keypair = Keypair.generate();
    const walletAdapter = new NodeWalletAdapter(keypair);
    await fundKeypair(keypair.publicKey, anchorProgram.provider.connection);
    const objectProvider = new AnchorProvider(
      provider.connection,
      walletAdapter,
      {
        preflightCommitment: 'processed',
        commitment: 'processed',
      },
    );
    return {
      publicKey: keypair.publicKey,
      program: new Program(IDL, anchorProgram.programId, objectProvider),
    };
  }
});
