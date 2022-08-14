import type { PersistedAttachment } from '../program/storage-api';
import type { PublicKey } from '@solana/web3.js';

export interface Profile {
  address: PublicKey;
  authority: PublicKey;
  object: PublicKey;
  nextAttachmentIdx: number;
}

export interface AttachmentAccount {
  address: PublicKey;
  sha256: Uint8Array;
  uri: string;
}

export interface Skill {
  name: string;
  description: string;
}

export interface PersistedSkill {
  skill: Skill;
  persistedAttachment: PersistedAttachment<null>;
  account: AttachmentAccount;
}

export interface AddSkillCommand {
  skill: Skill;
}

export interface Engagement {
  address: PublicKey;
  owner: Profile;
  counterParty: Profile;
}
