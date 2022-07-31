import { PublicKey } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';

(async () => {
  const [tokenPDA, _] = await PublicKey.findProgramAddress(
    [anchor.utils.bytes.utf8.encode('delink')],
    new PublicKey('ECcfUei1GzLwuLhvpoXqkcBvz3VA7MdUMLwqHxiMRfR'),
  );
  console.log(tokenPDA.toBase58());
})();
