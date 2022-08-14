import * as anchor from '@project-serum/anchor';
import { AnchorProvider, Program, setProvider } from '@project-serum/anchor';
import { Keypair } from '@solana/web3.js';
import type { Slink } from '../target/types/slink';
import { fundKeypair } from '../src/utils/utils';
import { NodeWalletAdapter } from '../src/utils/node-wallet-adapter';
import { SlinkApi } from '../src/slink/slink-api';
import { InMemoryAttachmentStorage } from './in-memory-attachement-storage';
import type { AddSkillCommand, Profile } from '../src/slink/model';
import type { AttachmentStorage } from '../src/program/storage-api';

describe('Slink application', () => {
  const provider = AnchorProvider.env();
  setProvider(provider);

  const anchorProgram = anchor.workspace.Slink as Program<Slink>;

  test('Can create user profile', async () => {
    // given
    const userApi = await createSlinkApi();
    // when
    const profile: Profile = await userApi.createProfile();
    // then
    expect(profile.authority.toBase58()).toBe(
      userApi.walletAdapter.publicKey.toBase58(),
    );
    expect(profile.authority.toBase58()).toBe(
      userApi.program.provider.publicKey?.toBase58(),
    );
    expect(profile.object.toBase58()).toBe(
      userApi.walletAdapter.publicKey.toBase58(),
    );
    expect(profile.object.toBase58()).toBe(
      userApi.program.provider.publicKey?.toBase58(),
    );
  });

  test('Can create skill record', async () => {
    // given
    const userApi = await createSlinkApi();
    await userApi.createProfile();
    // when
    const command: AddSkillCommand = {
      skill: {
        name: 'Solana',
        description: 'Solana is a decentralized network',
      },
    };
    const { persistedAttachment, account, skill } = await userApi.addSkill(
      command,
    );
    // then
    expect(skill.name).toBe(command.skill.name);
    expect(skill.description).toBe(command.skill.description);
    expect(account.sha256).toMatchObject(persistedAttachment.metadata.sha256);
    expect(account.uri).toBe(persistedAttachment.metadata.uri);
    expect(account.address.toBase58()).toBe(
      persistedAttachment.metadata.accountAddress.toBase58(),
    );
  });

  test('Can list skill records', async () => {
    // given
    const storage = new InMemoryAttachmentStorage();
    const user1Api = await createSlinkApi(storage);
    const user2Api = await createSlinkApi(storage);
    await user1Api.createProfile();
    // when
    const addSolanaSkillCommand: AddSkillCommand = {
      skill: {
        name: 'Solana',
        description: 'Solana is a decentralized network',
      },
    };
    const solanaSkill = await user1Api.addSkill(addSolanaSkillCommand);
    const addAnchorSkillCommand: AddSkillCommand = {
      skill: {
        name: 'Anchor',
        description:
          "Anchor is a framework for Solana's Sealevel runtime providing several convenient developer tools for writing smart contracts.",
      },
    };
    const anchorSkill = await user1Api.addSkill(addAnchorSkillCommand);
    // when
    const skills = await user2Api.findAllSkills(
      user1Api.walletAdapter.publicKey,
    );
    // then
    expect(skills).toHaveLength(2);
    expect(skills[0]).toMatchObject(solanaSkill);
    expect(skills[1]).toMatchObject(anchorSkill);
  });

  test('Can engage with organization', async () => {
    // given
    const user1Api = await createSlinkApi();
    const organizationApi = await createSlinkApi();
    const user1Profile = await user1Api.createProfile();
    const organizationProfile = await organizationApi.createProfile();
    // when
    const engagement = await user1Api.engageWith(organizationProfile);
    // then
    expect(engagement.owner).toMatchObject(user1Profile);
    expect(engagement.counterParty).toMatchObject(organizationProfile);
  });

  test('Can find engagement with organization', async () => {
    // given
    const user1Api = await createSlinkApi();
    const organizationApi = await createSlinkApi();
    const user1Profile = await user1Api.createProfile();
    const organizationProfile = await organizationApi.createProfile();
    await user1Api.engageWith(organizationProfile);
    // when
    const engagement = await user1Api.findEngagement(organizationProfile);
    // then
    expect(engagement.owner).toMatchObject(user1Profile);
    expect(engagement.counterParty).toMatchObject(organizationProfile);
  });

  async function createSlinkApi(
    storage: AttachmentStorage = new InMemoryAttachmentStorage(),
  ): Promise<SlinkApi> {
    const keypair = Keypair.generate();
    const walletAdapter = new NodeWalletAdapter(keypair);
    await fundKeypair(keypair.publicKey, anchorProgram.provider.connection);
    return SlinkApi.create(walletAdapter, storage);
  }
});
