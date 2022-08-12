import {
  Attachment,
  AttachmentMetadata,
  PersistedAttachment,
  SaveAttachmentCommand,
} from '../src/storage';
import { PublicKey } from '@solana/web3.js';

export type SlinkAttachmentType = 'skill' | 'experience';

export interface SlinkAttachment<T> extends Attachment<T> {
  type: SlinkAttachmentType;
}

export class PersistedSkill implements PersistedAttachment<Skill> {
  attachment: Attachment<Skill>;
  metadata: AttachmentMetadata;
}
export class Skill implements SlinkAttachment<null> {
  name: string;
  description: string;
  type: 'skill';
  payload: null;
}

export class SaveSkillCommand implements SaveAttachmentCommand<null> {
  attachment: Skill;
}

export interface CreateProfileCommand {
  address: PublicKey;
  authority: PublicKey;
  nextAttachmentIdx: number;
}

export interface Profile {
  address: PublicKey;
  authority: PublicKey;
  nextAttachmentIdx: number;
}
