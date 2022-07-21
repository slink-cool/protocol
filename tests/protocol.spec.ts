import {
  Program,
  Provider,
  setProvider,
  workspace,
} from '@project-serum/anchor';
import type { Protocol } from '../target/types/protocol';

describe('protocol', () => {
  // Configure the client to use the local cluster.
  setProvider(Provider.env());

  const program = workspace.Protocol as Program<Protocol>;

  it('Is initialized!', async () => {
    console.log(process.env.ANCHOR_PROVIDER_URL);
    // Add your test here.
    const tx = await program.rpc.initialize({});

    console.log('Your transaction signature', tx);
  });
});
