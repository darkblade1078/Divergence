import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import Faction from "../entities/faction";

export class SetFactionEmojiCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('name', true);
    const emoji = interaction.options.getString('emoji', true);
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

    const unicodeEmojiRegex =/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu.test(emoji);
    const customEmojiRegex = /^<a?:\w+:\d+>$/.test(emoji);

    if(!customEmojiRegex && !unicodeEmojiRegex)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Inputted text is not an emoji`)]});

    faction.emoji = emoji;

    await factionDatabase.save(faction);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} set the emoji of ${faction?.name} to ${faction?.emoji}`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Emoji Set`, `Set the emoji of ${faction?.name} to ${faction?.emoji}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('set_faction_emoji')
        .setDescription('Set an emoji for a faction')
        .addStringOption(option =>
          option
          .setName('name')
          .setDescription('The name of the faction you want to set the emoji for')
          .setAutocomplete(true)
          .setRequired(true)
        )
        .addStringOption(option =>
            option
            .setName('emoji')
            .setDescription('The emoji you want to set for the faction')
            .setRequired(true)
        )
    );
  }
}