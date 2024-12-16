import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import API from "../utils/api";
import Points from "../entities/points";

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
    const pointsRepository = database.getRepository(Points);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
            discordId: interaction.user.id
        },
    });

    if(!member)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)]});

    if(member.loggedIn)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`You already logged in for today`)]});

    const api = new API();

    const nation = await api.getNationInfo(id);

    if(nation == null)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation does not exist`)]});

    const currentDate = new Date();
    const nationLoginDate = new Date(nation.last_active);
    const currentDateUTC = new Date(currentDate.toISOString());
    const twentyFourHoursAgo = new Date(currentDateUTC.getTime() - 24 * 60 * 60 * 1000);

    if (nationLoginDate < twentyFourHoursAgo)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`You haven't logged in within the last 24 hours`)] });

    const newPoint = new Points();
    newPoint.value = 5;
    newPoint.created = new Date();
    newPoint.member = member;

    await pointsRepository.save(newPoint);

    member.totalPoints += 5;

    if(!member.points)
      member.points = [];
    member.loggedIn = true;

    await memberRepository.save(member);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Logged In`, `You have logged in and earned **5** points`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('login')
        .setDescription('Verify that you logged in to earn points')
    );
  }
}