import { Precondition } from '@sapphire/framework';
import { CommandInteraction, GuildMember, PermissionsBitField } from 'discord.js';

export class FactionRoleOnlyPrecondition extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.checkRole(interaction);
    }

    private async checkRole(interaction: CommandInteraction) {
        const member = interaction.member as GuildMember;
        return member.roles.cache.has(`${process.env.FACILITATOR_ROLE}`)
          ? this.ok()
          : this.error({ message: 'Only members with the facilitator role can use this command!' });
    }
}