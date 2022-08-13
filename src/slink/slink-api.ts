import { Program } from '@project-serum/anchor';
import type { AttachmentStorage } from '../program/storage-api';
import type { WalletAdapter } from '../utils/wallet-adapter';
import type { Slink } from '../../target/types/slink';
import { IDL } from '../../target/types/slink';
import { AnchorProvider } from '@project-serum/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import type { PersistedSkill, Profile, AddSkillCommand, Skill } from './model';
import {
  createObjectProfile,
  createObjectProfileAttachment,
  findNextObjectProfileAttachmentPda,
  getObjectProfilePda,
} from '../program/program-api';
import { decode, encode } from '../utils/utils';

export class SlinkApi {
  constructor(
    readonly walletAdapter: WalletAdapter,
    readonly program: Program<Slink>,
    readonly attachmentStorage: AttachmentStorage,
  ) {}

  async getProfile(): Promise<Profile | null> {
    const objectProfilePda = await getObjectProfilePda(
      this.walletAdapter.publicKey,
      this.program,
    );
    try {
      const account = await this.program.account.objectProfile.fetch(
        objectProfilePda,
      );
      return {
        address: objectProfilePda,
        object: account.objectAddress,
        authority: account.authority,
        nextAttachmentIdx: account.nextAttachmentIndex,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async createProfile(): Promise<Profile> {
    const { objectProfilePda } = await createObjectProfile(this.program);
    const account = await this.program.account.objectProfile.fetch(
      objectProfilePda,
    );
    return {
      address: account.entityAddress,
      object: account.objectAddress,
      authority: account.authority,
      nextAttachmentIdx: account.nextAttachmentIndex,
    };
  }

  async addProfileSkill(command: AddSkillCommand): Promise<PersistedSkill> {
    const profile: Profile | null = await this.getProfile();
    if (!profile) {
      throw new Error('Profile does not exist, create it first');
    }
    const nextObjectProfileAttachmentPda =
      await findNextObjectProfileAttachmentPda(
        profile.address,
        profile.nextAttachmentIdx,
        this.program,
      );
    const persistedAttachment = await this.attachmentStorage.save({
      attachment: {
        ...command.skill,
        payload: null,
        type: 'skill',
        accountPda: nextObjectProfileAttachmentPda,
      },
    });
    const { metadata, attachment } = persistedAttachment;
    const attachmentPda = await createObjectProfileAttachment(
      profile.address,
      encode(metadata.uri),
      metadata.sha256,
      this.program,
    );
    const onChainAttachment = await this.program.account.attachment.fetch(
      attachmentPda,
    );

    const uint8Array = new Uint8Array(onChainAttachment.sha256Hash);
    return {
      skill: {
        name: attachment.name,
        description: attachment.description,
      },
      account: {
        address: attachmentPda,
        sha256: uint8Array,
        uri: decode(onChainAttachment.uri),
      },
      persistedAttachment,
    };
  }

  static create(
    walletAdapter: WalletAdapter,
    attachmentStorage: AttachmentStorage,
  ) {
    const connection = new Connection('http://localhost:8899', {
      commitment: 'processed',
    });
    const provider = new AnchorProvider(connection, walletAdapter, {
      preflightCommitment: 'processed',
      commitment: 'processed',
    });
    const program = new Program(
      IDL,
      new PublicKey('Eyu3VjokBToM9jq9CE1ZuvuXBTH3v4xvSomwobHvBEqr'),
      provider,
    );
    return new SlinkApi(walletAdapter, program, attachmentStorage);
  }
}
