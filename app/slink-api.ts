import type { Delink } from '../target/types/delink';
import { Program } from '@project-serum/anchor';
import { AttachmentStorage } from '../src/storage';
import { PersistedSkill, Profile, SaveSkillCommand, Skill } from './model';
import {
  createObjectProfile,
  createObjectProfileAttachment,
  findNextObjectProfileAttachmentPda,
  getObjectProfilePda,
} from '../src/api';
import { Keypair } from '@solana/web3.js';
import { decode, encode } from '../src/utils';

export class SlinkApi {
  constructor(
    private readonly program: Program<Delink>,
    private readonly keypair: Keypair,
    private readonly storage: AttachmentStorage,
  ) {}

  async getProfile(): Promise<Profile | null> {
    const objectProfilePda = await getObjectProfilePda(
      this.keypair,
      this.program,
    );
    try {
      const account = await this.program.account.objectProfile.fetch(
        objectProfilePda,
      );
      return {
        address: account.entityAddress,
        authority: account.authority,
        nextAttachmentIdx: account.nextAttachmentIndex,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async createProfile(): Promise<Profile> {
    const { objectProfilePda } = await createObjectProfile(
      this.keypair,
      this.program,
    );
    const account = await this.program.account.objectProfile.fetch(
      objectProfilePda,
    );

    return {
      address: account.entityAddress,
      authority: account.authority,
      nextAttachmentIdx: account.nextAttachmentIndex,
    };
  }

  async saveSkill(command: SaveSkillCommand): Promise<PersistedSkill> {
    const profile: Profile | null = await this.getProfile();
    if (!profile) {
      throw new Error('Profile does not exist');
    }
    const nextObjectProfileAttachmentPda = findNextObjectProfileAttachmentPda(
      profile.address,
      profile.nextAttachmentIdx,
      this.program,
    );
    const { attachment, metadata } = await this.storage.save(command);
    const profileAttachmentPda = await createObjectProfileAttachment(
      profile.address,
      this.keypair,
      encode(metadata.uri),
      metadata.sha256,
      this.program,
    );
    const profileAttachment = await this.program.account.attachment.fetch(
      profileAttachmentPda,
    );
    return {
      attachment: {
        ...command.attachment,
      },
      metadata,
    };
  }

  findAllSkills() {}

  create(
    program: Program<Delink>,
    keypair: Keypair,
    attachmentStorage: AttachmentStorage,
  ) {
    return new SlinkApi(program, keypair, attachmentStorage);
  }
}
