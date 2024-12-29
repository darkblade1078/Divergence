import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import API from "../utils/api";

export class LinkPnwAccountCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const id = interaction.options.getNumber('id', true);
    const memberDatabase = database.getRepository(Member);
    const embeds = new embedGenerator(client);

    const member = await memberDatabase.findOne({
        where: {
          discordId: interaction.user.id
        }
    });

    if(!member)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`You are not in a faction`)]});

    const api = new API();

    const data = await api.getNationInfo(id);

    if(data == null)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation does not exist`)]});

    if(data.discord != interaction.user.username)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Discord do not match.\n>> <https://politicsandwar.com/nation/edit/>\nSet "Discord Username" to ${interaction.user.globalName}`)]});

    member.pnwID = data.id!;

    await memberDatabase.save(member);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Account linked`, `You are now linked to ${data.nation_name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('link_pnw_account')
        .setDescription('Set an emoji for a faction')
        .addNumberOption(option =>
          option
          .setName('id')
          .setDescription('The id of your nation')
          .setRequired(true)
        )
    );
  }
}