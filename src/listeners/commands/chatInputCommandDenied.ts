import { ChatInputCommandDeniedPayload, Events, Listener, UserError } from '@sapphire/framework';
import embedGenerator from '../../utils/embeds';

export class ChatInputCommandDenied extends Listener<typeof Events.ChatInputCommandDenied> {
	public async run(error: UserError, { interaction }: ChatInputCommandDeniedPayload) {
		await interaction.deferReply({ ephemeral: true });

		const embeds = new embedGenerator(this.container.client);

		return interaction.editReply({ embeds: [embeds.errorEmbed(error.message)]  });
	}
}