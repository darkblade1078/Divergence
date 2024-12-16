import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";

export class LogsCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['adminOnly']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    let logs = (await logRepository.find()).reverse();

    return interaction.editReply({ embeds: [embeds.logsEmbed(logs)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('logs')
        .setDescription('Look at recent logs')
    );
  }
}