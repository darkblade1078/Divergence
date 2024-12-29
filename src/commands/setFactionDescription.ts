import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import Faction from "../entities/faction";

export class SetFactionDescriptionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['adminOnly']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('name', true);
    const description = interaction.options.getString('description', true);
    const logRepository = database.getRepository(Log);
    const factionDatabase = database.getRepository(Faction);
    const embeds = new embedGenerator(client);

    const faction = await factionDatabase.findOne({
        where: {
            name
        }
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    faction.description = description;

    await factionDatabase.save(faction);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} set the description of ${faction?.name}`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Description Set`, `Set the description of ${faction?.name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('set_faction_description')
        .setDescription('Set an description for a faction')
        .addStringOption(option =>
          option
          .setName('name')
          .setDescription('The name of the faction you want to set the description for')
          .setAutocomplete(true)
          .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('description')
            .setDescription('The description you want to set for the faction')
            .setRequired(true)
        )
    );
  }
}