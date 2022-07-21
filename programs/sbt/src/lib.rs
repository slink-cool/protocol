use anchor_lang::prelude::*;

declare_id!("XV93mE9SR2baA5b7bq2JRAj3JtMjL4Y9pMQChrBH7YB");

#[program]
pub mod sbt {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
