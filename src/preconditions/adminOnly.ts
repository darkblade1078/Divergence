import { Precondition } from '@sapphire/framework';
import { CommandInteraction, PermissionsBitField } from 'discord.js';

export class AdminOnlyPrecondition extends Precondition {

    public override async chatInputRun(interaction: CommandInteraction) {
        return this.CheckAdmin(interaction);
    }

    private async CheckAdmin(interaction: CommandInteraction) {
        return interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)
          ? this.ok()
          : this.error({ message: 'Only server admins can use this command!' });
    }
}