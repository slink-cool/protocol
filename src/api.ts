import { Keypair, PublicKey } from '@solana/web3.js';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import type { Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import type { Delink } from '../target/types/delink';
import { fundKeypair } from './utils';

export async function createObjectProfile(
  keypair: Keypair,
  program: Program<Delink>,
) {
  const objectKeypair = Keypair.generate();
  await fundKeypair(objectKeypair.publicKey, program.provider.connection);
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

export async function createObjectProfileAttachment(
  objectProfilePda: PublicKey,
  objectKeypair: Keypair,
  uri: Uint8Array,
  sha256: Uint8Array,
  program: Program<Delink>,
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

export async function createObjectsRelation(
  objectAProfilePda: PublicKey,
  objectBProfilePda: PublicKey,
  objectAKeypair: Keypair,
  program: Program<Delink>,
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

export async function createObjectRelationAttachment(
  objectsRelationPda: PublicKey,
  objectAKeypair: Keypair,
  uri: Uint8Array,
  sha256: Uint8Array,
  program: Program<Delink>,
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
