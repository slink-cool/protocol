use anchor_lang::prelude::*;

declare_id!("ECcfUsei1GzLwuLhvpoXqkcBvz3VA7MdUMLwqHxiMRfR");

#[program]
pub mod delink {
    use super::*;

    pub fn create_object_profile(ctx: Context<CreateObjectProfile>, object_address: Pubkey) -> Result<()> {
        ctx.accounts.object_profile.init(
            object_address,
            ctx.accounts.creator.key(),
            *ctx.bumps.get("object_profile").unwrap(),
        )
    }

    pub fn create_object_profile_attachment(ctx: Context<CreateObjectProfileAttachment>, uri: [u8; 128], sha_256_hash: [u8; 64]) -> Result<()> {
        let object_profile = &mut ctx.accounts.object_profile;
        let _attachment = ctx.accounts.object_profile_attachment.init(
            object_profile.key(),
            uri,
            sha_256_hash,
            ctx.accounts.creator.key(),
            object_profile.next_attachment_index,
            *ctx.bumps.get("object_profile_attachment").unwrap(),
        );
        object_profile.next_attachment_index = object_profile.next_attachment_index.checked_add(1).unwrap();
        Ok(())
    }

    pub fn create_objects_relation(ctx: Context<CreateObjectsRelation>) -> Result<()> {
        let result = ctx.accounts.objects_relation.init(
            ctx.accounts.object_a_profile.key(),
            ctx.accounts.object_b_profile.key(),
            ctx.accounts.creator.key(),
            *ctx.bumps.get("objects_relation").unwrap(),
        );
        result
    }

    pub fn create_objects_relation_attachment(ctx: Context<CreateObjectsRelationAttachment>, uri: [u8; 128], sha_256_hash: [u8; 64]) -> Result<()> {
        let objects_relation = &mut ctx.accounts.objects_relation;
        let _attachment = ctx.accounts.objects_relation_attachment.init(
            objects_relation.key(),
            uri,
            sha_256_hash,
            ctx.accounts.creator.key(),
            objects_relation.next_attachment_index,
            *ctx.bumps.get("objects_relation_attachment").unwrap(),
        );
        objects_relation.next_attachment_index = objects_relation.next_attachment_index.checked_add(1).unwrap();
        Ok(())
    }

    pub fn create_acknowledgment(ctx: Context<CreateAcknowledgment>, _profile_address: Pubkey, attachment_index: u8) -> Result<()> {
        let attachment = &ctx.accounts.object_profile_attachment;
        let result = ctx.accounts.acknowledgement.init(
            attachment.key(),
            ctx.accounts.creator.key(),
            attachment_index,
            *ctx.bumps.get("acknowledgement").unwrap(),
        );
        result
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
        bump,
        constraint = creator.key() == object_address @DelinkError::AuthorizationError,
    )]
    pub object_profile: Account<'info, ObjectProfile>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CreateObjectProfileAttachment<'info> {
    #[account(
        mut,
        seeds = [
            b"object_profile",
            object_profile.object_address.as_ref(),
        ],
        bump = object_profile.bump,
        constraint = creator.key() == object_profile.object_address @DelinkError::AuthorizationError,
    )]
    pub object_profile: Account<'info, ObjectProfile>,
    #[account(
        init,
        payer = creator,
        space = Attachment::SIZE,
        seeds = [
            b"object_profile_attachment",
            object_profile.key().as_ref(),
            &object_profile.next_attachment_index.to_le_bytes()
        ],
        bump,
    )]
    pub object_profile_attachment: Account<'info, Attachment>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateObjectsRelation<'info> {
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
        space = ObjectsRelation::SIZE,
        seeds = [
            b"objects_relation",
            object_a_profile.key().as_ref(),
            object_b_profile.key().as_ref(),
        ],
        bump,
        constraint = creator.key() == object_a_profile.object_address @DelinkError::AuthorizationError,
        constraint = object_a_profile.key() != object_b_profile.key() @DelinkError::CyclicLinkError,
    )]
    pub objects_relation: Account<'info, ObjectsRelation>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct CreateObjectsRelationAttachment<'info> {
    #[account(
        mut,
        seeds = [
            b"objects_relation",
            objects_relation.object_a_profile_address.as_ref(),
            objects_relation.object_b_profile_address.as_ref(),
        ],
        bump,
        constraint = creator.key() == objects_relation.created_by @DelinkError::AuthorizationError,
    )]
    pub objects_relation: Account<'info, ObjectsRelation>,
    #[account(
        init,
        payer = creator,
        space = Attachment::SIZE,
        seeds = [
            b"objects_relation_attachment",
            objects_relation.key().as_ref(),
            &objects_relation.next_attachment_index.to_le_bytes()
        ],
        bump,
    )]
    pub objects_relation_attachment: Account<'info, Attachment>,
    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(profile_address: Pubkey, attachment_index: u8)]
pub struct CreateAcknowledgment<'info> {
    #[account(
        seeds = [
            b"objects_relation",
            objects_relation_ac.object_a_profile_address.as_ref(),
            objects_relation_ac.object_b_profile_address.as_ref(),
        ],
        bump = objects_relation_ac.bump,
    )]
    pub objects_relation_ac: Account<'info, ObjectsRelation>,

    #[account(
        seeds = [
            b"objects_relation",
            objects_relation_bc.object_a_profile_address.as_ref(),
            objects_relation_bc.object_b_profile_address.as_ref(),
        ],
        bump = objects_relation_bc.bump,
    )]
    pub objects_relation_bc: Account<'info, ObjectsRelation>,

    #[account(
        seeds = [
            b"object_profile_attachment",
            profile_address.as_ref(),
            &attachment_index.to_le_bytes()
        ],
        bump = object_profile_attachment.bump,
        constraint = object_profile_attachment.entity_address == profile_address @DelinkError::AuthorizationError,
    )]
    pub object_profile_attachment: Account<'info, Attachment>,

    #[account(
        init,
        payer = creator,
        space = Acknowledgment::SIZE,
        seeds = [
            b"acknowledgement",
            object_profile_attachment.key().as_ref()
        ],
        bump,
        constraint = objects_relation_ac.object_b_profile_address == objects_relation_bc.object_b_profile_address @DelinkError::ProfilesNotLinkedError,
        constraint = creator.key() != object_profile_attachment.created_by @DelinkError::AuthorizationError,
        constraint = objects_relation_ac.object_a_profile_address == profile_address || objects_relation_bc.object_a_profile_address == profile_address @DelinkError::AuthorizationError,
    )]
    pub acknowledgement: Account<'info, Acknowledgment>,

    #[account(mut)]
    pub creator: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ObjectProfile {
    pub object_address: Pubkey,
    pub authority: Pubkey,
    pub next_attachment_index: u8,
    pub created_at: u32,
    pub bump: u8,
}

impl ObjectProfile {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // object_address
        32 +  // authority
        8 +   // next_attachment_index
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, object_address: Pubkey, authority: Pubkey, bump: u8) -> Result<()> {
        self.object_address = object_address;
        self.authority = authority;
        self.next_attachment_index = 0;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}

#[account]
pub struct ObjectsRelation {
    pub object_a_profile_address: Pubkey,
    pub object_b_profile_address: Pubkey,
    pub created_by: Pubkey,
    pub next_attachment_index: u8,
    pub created_at: u32,
    pub bump: u8,
}

impl ObjectsRelation {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // object_profile_a_address
        32 +  // object_profile_b_address
        32 +  // created_by
        8 +  // next_attachment_index
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, object_a_profile_address: Pubkey, object_b_profile_address: Pubkey, created_by: Pubkey, bump: u8) -> Result<()> {
        self.object_a_profile_address = object_a_profile_address;
        self.object_b_profile_address = object_b_profile_address;
        self.created_by = created_by;
        self.next_attachment_index = 0;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}


#[account]
pub struct Attachment {
    pub entity_address: Pubkey,
    pub uri: [u8; 128],
    pub sha_256_hash: [u8; 64],
    pub created_by: Pubkey,
    pub index: u8,
    pub created_at: u32,
    pub bump: u8,
}

impl Attachment {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // entity_address
        128 +  // uri
        64 +  // sha_256_hash
        32 +  // created_by
        8 +   // index
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, entity_address: Pubkey, uri: [u8; 128], sha_256_hash: [u8; 64], created_by: Pubkey, index: u8, bump: u8) -> Result<()> {
        self.entity_address = entity_address;
        self.uri = uri;
        self.sha_256_hash = sha_256_hash;
        self.created_by = created_by;
        self.index = index;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}


#[account]
pub struct Acknowledgment {
    pub entity_address: Pubkey,
    pub created_by: Pubkey,
    pub index: u8,
    pub created_at: u32,
    pub bump: u8,
}

impl Acknowledgment {
    pub const SIZE: usize = 8 + // discriminator
        32 +  // entity_address
        32 +  // created_by
        8 +   // index
        32 +  // created_at
        1;    // bump

    pub fn init(&mut self, entity_address: Pubkey, created_by: Pubkey, index: u8, bump: u8) -> Result<()> {
        self.entity_address = entity_address;
        self.created_by = created_by;
        self.index = index;
        self.created_at = Clock::get()?.unix_timestamp as u32;
        self.bump = bump;
        Ok(())
    }
}

#[error_code]
pub enum DelinkError {
    AuthorizationError,
    ProfilesNotLinkedError,
    CyclicLinkError,
}
