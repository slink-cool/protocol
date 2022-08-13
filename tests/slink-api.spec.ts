import * as anchor from '@project-serum/anchor';
import { AnchorProvider, Program, setProvider } from '@project-serum/anchor';
import { Keypair } from '@solana/web3.js';
import type { Slink } from '../target/types/slink';
import { fundKeypair } from '../src/utils/utils';
import { NodeWalletAdapter } from '../src/utils/node-wallet-adapter';
import { SlinkApi } from '../src/slink/slink-api';
import { InMemoryAttachmentStorage } from './in-memory-attachement-storage';
import type { AddSkillCommand, Profile } from '../src/slink/model';

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
    const { persistedAttachment, account, skill } =
      await userApi.addProfileSkill(command);
    // then
    expect(skill.name).toBe(command.skill.name);
    expect(skill.description).toBe(command.skill.description);
    expect(account.sha256).toMatchObject(persistedAttachment.metadata.sha256);
    expect(account.uri).toBe(persistedAttachment.metadata.uri);
    expect(account.address.toBase58()).toBe(
      persistedAttachment.metadata.accountAddress.toBase58(),
    );
  });

  async function createSlinkApi() {
    const keypair = Keypair.generate();
    const walletAdapter = new NodeWalletAdapter(keypair);
    await fundKeypair(keypair.publicKey, anchorProgram.provider.connection);
    return SlinkApi.create(walletAdapter, new InMemoryAttachmentStorage());
  }
});
