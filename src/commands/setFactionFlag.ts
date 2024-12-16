import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import Faction from "../entities/faction";

export class SetFactionFlagCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('name', true);
    const flag = interaction.options.getAttachment('flag', true);
    const logRepository = database.getRepository(Log);
    const factionDatabase = database.getRepository(Faction);
    const embeds = new embedGenerator(client);

    const faction = await factionDatabase.findOne({
        where: {
            name
        },
        relations: ['members']
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    if(!flag.url.includes('.png'))
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Image must be a png`)]});

    faction.flag = flag.url;

    await factionDatabase.save(faction);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} set the flag of ${faction?.name} to ${faction?.flag}`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Flag Set`, `Set the flag of ${faction?.name} to ${faction?.flag}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('set_faction_flag')
        .setDescription('Set an flag for a faction')
        .addStringOption(option =>
          option
          .setName('name')
          .setDescription('The name of the faction you want to set the flag for')
          .setAutocomplete(true)
          .setRequired(true)
        )
        .addAttachmentOption(option =>
            option
            .setName('flag')
            .setDescription('The flag you want to set for the faction')
            .setRequired(true)
        )
    );
  }
}