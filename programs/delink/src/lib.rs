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

    pub fn create_objects_engagement(ctx: Context<CreateObjectsEngagement>) -> Result<()> {
        ctx.accounts.objects_engagement.init(
            ctx.accounts.object_a_profile.key(),
            ctx.accounts.object_b_profile.key(),
            *ctx.bumps.get("objects_engagement").unwrap(),
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
        seeds = [
            b"object_profile",
            object_address.as_ref()
        ],
        bump
    )]
    pub object_profile: Account<'info, ObjectProfile>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// This account is used to prove engagement between 2 parties
/// TODO: think how to secure the initialization to proof the engagement
/// a) This is unidirectional => both parties must create relation
/// b) This is bidirectional => multiple signatures are needed for init transaction
#[derive(Accounts)]
pub struct CreateObjectsEngagement<'info> {
    #[account(
        seeds = [
            b"object_profile",
            object_a_profile.object_address.as_ref(),
        ],
        bump = object_a_profile.bump,
    )]
    pub object_a_profile: Account<'info, ObjectProfile>,
    #[account(
        seeds = [
            b"object_profile",
            object_b_profile.object_address.as_ref(),
        ],
        bump = object_b_profile.bump,
    )]
    pub object_b_profile: Account<'info, ObjectProfile>,
    #[account(
        init,
            payer = creator,
            space = ObjectsEngagement::SIZE,
            seeds = [
                b"objects_engagement",
                object_a_profile.key().as_ref(),
                object_b_profile.key().as_ref(),
            ],
            constraint = signer2.key() == object_a_profile.object_address,
        bump
    )]
    pub objects_engagement: Account<'info, ObjectsEngagement>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub signer2: Signer<'info>,
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

#[account]
pub struct ObjectsEngagement {
    pub object_a_profile_address: Pubkey,
    pub object_b_profile_address: Pubkey,
    pub created_at: u32,
    pub bump: u8,
}

impl ObjectsEngagement {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // object_profile_a_address
        32 +  // object_profile_b_address
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, object_a_profile_address: Pubkey, object_b_profile_address: Pubkey, bump: u8) -> Result<()> {
        self.object_a_profile_address = object_a_profile_address;
        self.object_b_profile_address = object_b_profile_address;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}
