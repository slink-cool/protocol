import { AnchorProvider, Program } from '@project-serum/anchor';
import type { AttachmentStorage } from '../program/storage-api';
import type { WalletAdapter } from '../utils/wallet-adapter';
import type { Slink } from '../../target/types/slink';
import { IDL } from '../../target/types/slink';
import { Connection, PublicKey } from '@solana/web3.js';
import type {
  AddSkillCommand,
  Engagement,
  PersistedSkill,
  Profile,
} from './model';
import {
  createObjectProfile,
  createObjectProfileAttachment,
  createObjectsRelation,
  findNextObjectProfileAttachmentPda,
  findObjectsRelationPda,
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
    const profileOwner = this.walletAdapter.publicKey;
    return this.findProfileByOwner(profileOwner);
  }

  async findProfileByOwner(owner: PublicKey): Promise<Profile | null> {
    const objectProfilePda = await getObjectProfilePda(owner, this.program);
    return await this.findProfileByAddress(objectProfilePda);
  }

  private async findProfileByAddress(address: PublicKey) {
    try {
      const account = await this.program.account.objectProfile.fetch(address);
      return {
        address: address,
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
      address: objectProfilePda,
      object: account.objectAddress,
      authority: account.authority,
      nextAttachmentIdx: account.nextAttachmentIndex,
    };
  }

  async addSkill(command: AddSkillCommand): Promise<PersistedSkill> {
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

    const sha256 = new Uint8Array(onChainAttachment.sha256Hash);
    return {
      skill: {
        name: attachment.name,
        description: attachment.description,
      },
      account: {
        address: attachmentPda,
        sha256,
        uri: decode(onChainAttachment.uri),
      },
      persistedAttachment,
    };
  }

  async findAllSkills(owner: PublicKey): Promise<PersistedSkill[]> {
    const profile: Profile | null = await this.findProfileByOwner(owner);
    if (!profile) {
      throw new Error('Profile does not exist, create it first');
    }
    const allSkills = await this.attachmentStorage.findAll<null>('skill');
    const accountPdas = allSkills.map((it) => it.attachment.accountPda);
    const onChainAccounts = await Promise.all(
      accountPdas.map(async (it) => {
        const account = await this.program.account.attachment.fetch(it);
        return {
          address: it,
          account,
        };
      }),
    );
    return allSkills.map((persistedAttachment) => {
      const onChainAttachment = onChainAccounts.find((it) =>
        it.address.equals(persistedAttachment.attachment.accountPda),
      )!;
      const sha256 = new Uint8Array(onChainAttachment.account.sha256Hash);
      const uri = decode(onChainAttachment.account.uri);
      const ps: PersistedSkill = {
        skill: {
          name: persistedAttachment.attachment.name,
          description: persistedAttachment.attachment.description,
        },
        persistedAttachment,
        account: {
          address: onChainAttachment.address,
          uri: uri,
          sha256,
        },
      };
      return ps;
    });
  }

  async engageWith(counterParty: Profile): Promise<Engagement> {
    const profile = await this.findProfileByOwner(this.walletAdapter.publicKey);
    if (!profile) {
      throw new Error('Profile does not exist, create it first');
    }
    const objectsRelationPda = await createObjectsRelation(
      profile.address,
      counterParty.address,
      this.program,
    );
    return {
      address: objectsRelationPda,
      owner: profile,
      counterParty,
    };
  }

  async findEngagement(counterParty: Profile): Promise<Engagement> {
    const profile = await this.findProfileByOwner(this.walletAdapter.publicKey);
    if (!profile) {
      throw new Error('Profile does not exist, create it first');
    }
    const objectsRelationPda = await findObjectsRelationPda(
      profile.address,
      counterParty.address,
      this.program,
    );
    const account = await this.program.account.objectsRelation.fetch(
      objectsRelationPda,
    );
    const profileFound = await this.findProfileByAddress(
      account.objectAProfileAddress,
    );
    const counterPartyProfileFound = await this.findProfileByAddress(
      account.objectBProfileAddress,
    );
    if (!profileFound) {
      throw new Error('Profile does not exist, create it first');
    }
    if (!counterPartyProfileFound) {
      throw new Error('Counterparty profile does not exist, create it first');
    }
    return {
      address: objectsRelationPda,
      owner: profileFound,
      counterParty: counterPartyProfileFound,
    };
  }

  static create(
    walletAdapter: WalletAdapter,
    attachmentStorage: AttachmentStorage,
    rpcUrl: string = 'http://localhost:8899',
  ) {
    const connection = new Connection(rpcUrl, {
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
