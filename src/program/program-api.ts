import { PublicKey } from '@solana/web3.js';
import { utf8 } from '@project-serum/anchor/dist/cjs/utils/bytes';
import type { Program } from '@project-serum/anchor';
import type { Slink } from '../../target/types/slink';
import { BN } from '@project-serum/anchor';

export async function getObjectProfilePda(
  object: PublicKey,
  program: Program<Slink>,
) {
  const [objectProfilePda] = await PublicKey.findProgramAddress(
    [utf8.encode('object_profile'), object.toBuffer()],
    program.programId,
  );
  return objectProfilePda;
}

export async function createObjectProfile(program: Program<Slink>) {
  const object = program.provider.publicKey!;
  const objectProfilePda = await getObjectProfilePda(object, program);
  await program.methods
    .createObjectProfile(object)
    .accounts({
      objectProfile: objectProfilePda,
      creator: program.provider.publicKey,
    })
    .rpc();
  return { object, objectProfilePda };
}

export async function findNextObjectProfileAttachmentPda(
  objectProfilePda: PublicKey,
  nextAttachmentIndex: number,
  program: Program<Slink>,
) {
  const [objectProfileAttachmentPda] = await PublicKey.findProgramAddress(
    [
      utf8.encode('object_profile_attachment'),
      objectProfilePda.toBuffer(),
      new BN(nextAttachmentIndex).toArrayLike(Buffer),
    ],
    program.programId,
  );
  return objectProfileAttachmentPda;
}

export async function createObjectProfileAttachment(
  objectProfilePda: PublicKey,
  uri: Uint8Array,
  sha256: Uint8Array,
  program: Program<Slink>,
) {
  const objectProfileBefore = await program.account.objectProfile.fetch(
    objectProfilePda,
  );
  const nextAttachmentIndex = objectProfileBefore.nextAttachmentIndex;
  const objectProfileAttachmentPda = await findNextObjectProfileAttachmentPda(
    objectProfilePda,
    nextAttachmentIndex,
    program,
  );
  await program.methods
    .createObjectProfileAttachment(
      uri as unknown as number[],
      sha256 as unknown as number[],
    )
    .accounts({
      objectProfile: objectProfilePda,
      objectProfileAttachment: objectProfileAttachmentPda,
      creator: program.provider.publicKey,
    })
    .rpc();
  return objectProfileAttachmentPda;
}

export async function createObjectsRelation(
  objectAProfilePda: PublicKey,
  objectBProfilePda: PublicKey,
  program: Program<Slink>,
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
      creator: program.provider.publicKey,
    })
    .rpc();
  return objectsRelationPda;
}

export async function createObjectRelationAttachment(
  objectsRelationPda: PublicKey,
  uri: Uint8Array,
  sha256: Uint8Array,
  program: Program<Slink>,
) {
  const relationBefore = await program.account.objectsRelation.fetch(
    objectsRelationPda,
  );
  const nextAttachmentIndex = relationBefore.nextAttachmentIndex;
  const [objectsRelationAttachmentPda] = await PublicKey.findProgramAddress(
    [
      utf8.encode('objects_relation_attachment'),
      objectsRelationPda.toBuffer(),
      new BN(nextAttachmentIndex).toArrayLike(Buffer),
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
      creator: program.provider.publicKey,
    })
    .rpc();
  return objectsRelationAttachmentPda;
}
