import { Program, setProvider, workspace } from '@project-serum/anchor';
import type { Protocol } from '../target/types/protocol';
import { AnchorProvider } from '@project-serum/anchor/dist/cjs/provider';

describe('protocol', () => {
  setProvider(AnchorProvider.env());

  const program = workspace.Protocol as Program<Protocol>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.methods.initialize();

    console.log('Your transaction signature', tx);
  });
});
