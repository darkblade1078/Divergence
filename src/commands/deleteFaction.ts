import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import Faction from "../entities/faction";

export class DeleteFactionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['adminOnly']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('faction', true);
    const factionRepository = database.getRepository(Faction);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const faction = await factionRepository.findOneBy({
        name
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});
    
    await factionRepository.delete(faction);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} deleted ${faction.name}`,
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Deleted`, `${faction.name} is now the deleted`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('delete_faction')
        .setDescription('Delete a faction')
        .addStringOption(option =>
            option
            .setName('faction')
            .setDescription('The faction you want to delete')
            .setAutocomplete(true)
            .setRequired(true)
        )
    );
  }
}