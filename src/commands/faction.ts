import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Faction from "../entities/faction";

export class FactionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('faction', true);
    const factionRepository = database.getRepository(Faction);
    const embeds = new embedGenerator(client);

    const faction = await factionRepository.findOne({
        where: {
          name
        },
        relations: ['members']
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    return interaction.editReply({ embeds: [embeds.factionEmbed(faction)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('faction')
        .setDescription('Get info on a faction')
        .addStringOption(option =>
            option
            .setName('faction')
            .setDescription('The faction you want to lookup')
            .setAutocomplete(true)
            .setRequired(true)
        )
    );
  }
}