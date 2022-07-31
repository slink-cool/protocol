use anchor_lang::prelude::*;

declare_id!("ECcfUsei1GzLwuLhvpoXqkcBvz3VA7MdUMLwqHxiMRfR");

#[program]
pub mod delink {
    use super::*;

    pub fn create_object_profile(ctx: Context<CreateObjectProfile>, object_address: Pubkey) -> Result<()> {
        ctx.accounts.object_profile.init(
            object_address,
            *ctx.bumps.get("object_profile").unwrap(),
        )
    }
}


#[derive(Accounts)]
#[instruction(object_address: Pubkey)]
pub struct CreateObjectProfile<'info> {
    #[account(
    init,
        payer = creator,
        space = ObjectProfile::SIZE,
        seeds = [b"object_profile", object_address.as_ref()], bump
    )]
    pub object_profile: Account<'info, ObjectProfile>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[account]
pub struct ObjectProfile {
    pub object_address: Pubkey,
    pub created_at: u32,
    pub bump: u8,
}

impl ObjectProfile {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // object_address
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, object_address: Pubkey, bump: u8) -> Result<()> {
        self.object_address = object_address;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}
