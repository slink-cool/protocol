use anchor_lang::prelude::*;

declare_id!("ECcfUsei1GzLwuLhvpoXqkcBvz3VA7MdUMLwqHxiMRfR");

#[program]
pub mod token {
    use super::*;

    pub fn create(ctx: Context<CreateToken>, authority: Pubkey) -> Result<()> {
        let token = &mut ctx.accounts.token;
        token.authority = authority;
        token.bump = *ctx.bumps.get("token").unwrap();
        Ok(())
    }

    pub fn create_user_token(ctx: Context<CreateUserToken>, count: u32) -> Result<()> {
        let user_token = &mut ctx.accounts.user_token;
        user_token.count = count;
        user_token.bump = *ctx.bumps.get("user_token").unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: fdsfgs
    pub create_key: AccountInfo<'info>, // random key(or not) used to seed the pda
    // space: 8 discriminator + 32 authority + 1 bump
    #[account(init, payer = owner, space = 8 + 32 + 1, seeds = [b"token", create_key.key().as_ref()], bump)]
    pub token: Account<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserToken<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: fdsfgs
    pub token: AccountInfo<'info>,
    /// CHECK: fdsfgs
    pub user: AccountInfo<'info>,
    // space: 8 discriminator + 4 count + 1 bump
    #[account(
        init,
        payer = owner,
        space = 8 + 4 + 1, seeds = [b"user-token", owner.key().as_ref(), user.key().as_ref(), token.key().as_ref()], bump
    )]
    pub user_token: Account<'info, UserToken>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserToken {
    bump: u8,
    count: u32,
}

#[account]
pub struct Token {
    bump: u8,
    pub authority: Pubkey,
}
