import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import API from "../utils/api";

export class LinkAccountCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const id = interaction.options.getNumber('id', true);
    const memberRepository = database.getRepository(Member);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
            discordId: interaction.user.id
        },
    });

    if(!member)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)]});

    const idCheck = await memberRepository.exists({
        where: {
            pnwID: id
        }
    });

    if(idCheck)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation already linked`)]});

    const api = new API();

    const nation = await api.getNationInfo(id);

    if(nation == null)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation does not exist`)]});

    member.pnwID = id;

    await memberRepository.save(member);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Linked`, `You have linked your pnw account`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('link_account')
        .setDescription('Link your pnw account to your discord account')
        .addUserOption(option =>
            option
            .setName('id')
            .setDescription('Your PNW ID')
            .setRequired(true)
        )
    );
  }
}