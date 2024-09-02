use anchor_lang::prelude::*;

declare_id!("7TgnvEJ3UWAfuVsJJd7Ld5Ued2kcn5MEfbjmMXXAgsTQ");

#[program]
pub mod anchor_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
