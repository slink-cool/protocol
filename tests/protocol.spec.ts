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

  test('Can add single attachment to profile', async () => {
    // given
    const { objectProfilePda, objectKeypair } = await createObjectProfile();
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    // when
    const profileAttachmentPda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
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
    const { objectProfilePda, objectKeypair } = await createObjectProfile();
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const attachment1Pda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
    );
    const attachment2Pda = await createObjectProfileAttachment(
      objectProfilePda,
      objectKeypair,
      encode(uri),
      sha256,
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
    } = await createObjectProfile();
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile();
    // when
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
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
    } = await createObjectProfile();
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile();
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
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
    } = await createObjectProfile();
    const { objectProfilePda: objectBProfilePda } = await createObjectProfile();
    const objectsRelationPda = await createObjectsRelation(
      objectAProfilePda,
      objectBProfilePda,
      objectAKeypair,
    );
    const uri =
      'https://app.slink.cool/profiles/grkhrA8hQpcLQz2V6pAoGFEaW1kXu7e1myhrqGUYNcc';
    const sha256 = new Uint8Array(new Array(64).fill(228));
    const objectsRelationAttachment1Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      objectAKeypair,
      encode(uri),
      sha256,
    );
    const objectsRelationAttachment2Pda = await createObjectRelationAttachment(
      objectsRelationPda,
      objectAKeypair,
      encode(uri),
      sha256,
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
    } = await createObjectProfile();
    const {
      objectProfilePda: objectBProfilePda,
      objectKeypair: objectBKeypair,
    } = await createObjectProfile();
    const { objectProfilePda: objectOrgProfilePda } =
      await createObjectProfile();
    const objectsRelationAOrgPda = await createObjectsRelation(
      objectAProfilePda,
      objectOrgProfilePda,
      objectAKeypair,
    );
    const objectsRelationBOrgPda = await createObjectsRelation(
      objectBProfilePda,
      objectOrgProfilePda,
      objectBKeypair,
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
        creator: objectKeypair.publicKey,
      })
      .signers([objectKeypair])
      .rpc();
    return { objectKeypair, objectProfilePda };
  }

  async function createObjectProfileAttachment(
    objectProfilePda: PublicKey,
    objectKeypair: Keypair,
    uri: Uint8Array,
    sha256: Uint8Array,
  ) {
    const objectProfileBefore = await program.account.objectProfile.fetch(
      objectProfilePda,
    );
    const nextAttachmentIndex = objectProfileBefore.nextAttachmentIndex;
    const [objectProfileAttachmentPda] = await PublicKey.findProgramAddress(
      [
        utf8.encode('object_profile_attachment'),
        objectProfilePda.toBuffer(),
        new anchor.BN(nextAttachmentIndex).toArrayLike(Buffer),
      ],
      program.programId,
    );
    await program.methods
      .createObjectProfileAttachment(
        uri as unknown as number[],
        sha256 as unknown as number[],
      )
      .accounts({
        objectProfile: objectProfilePda,
        objectProfileAttachment: objectProfileAttachmentPda,
        creator: objectKeypair.publicKey,
      })
      .signers([objectKeypair])
      .rpc();
    return objectProfileAttachmentPda;
  }

  async function createObjectsRelation(
    objectAProfilePda: PublicKey,
    objectBProfilePda: PublicKey,
    objectAKeypair: Keypair,
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
        creator: objectAKeypair.publicKey,
      })
      .signers([objectAKeypair])
      .rpc();
    return objectsRelationPda;
  }

  async function createObjectRelationAttachment(
    objectsRelationPda: PublicKey,
    objectAKeypair: Keypair,
    uri: Uint8Array,
    sha256: Uint8Array,
  ) {
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
      .createObjectsRelationAttachment(
        uri as unknown as number[],
        sha256 as unknown as number[],
      )
      .accounts({
        objectsRelation: objectsRelationPda,
        objectsRelationAttachment: objectsRelationAttachmentPda,
        creator: objectAKeypair.publicKey,
      })
      .signers([objectAKeypair])
      .rpc();
    return objectsRelationAttachmentPda;
  }

  function encode(s: string): Uint8Array {
    const space = 128;
    const maxLength = space - 1;
    const encoded = new TextEncoder().encode(s);
    if (encoded.length > maxLength) {
      throw new Error();
    }
    const result = new Array(space).fill(0);
    result[0] = encoded.length;
    encoded.forEach((it, idx) => (result[idx + 1] = it));
    return new Uint8Array(result);
  }

  function decode(s: number[]): string {
    const length = s[0]!;
    const data = s.slice(1, length + 1);
    return new TextDecoder().decode(new Uint8Array(data));
  }
});
