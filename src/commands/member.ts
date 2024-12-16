import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";

export class MemberCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const user = interaction.options.getUser('member', true);
    const memberRepository = database.getRepository(Member);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
          discordId: user.id
        },
        relations: ['faction']
    });

    if(!member)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in a faction`)]});

    return interaction.editReply({ embeds: [embeds.memberEmbed(user, member)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('member')
        .setDescription('Get info on a member')
        .addUserOption(option =>
            option
            .setName('member')
            .setDescription('The member you want to lookup')
            .setRequired(true)
        )
    );
  }
}