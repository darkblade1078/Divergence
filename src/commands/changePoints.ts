import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import Log from "../entities/log";
import Points from "../entities/points";

export class ChangePointsCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['factionRole']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const user = interaction.options.getUser('user', true);
    const points = interaction.options.getNumber('points', true);
    const memberRepository = database.getRepository(Member);
    const pointsRepository = database.getRepository(Points);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
          discordId: user.id,
        },
        relations: ['points']
    });

    if(!member)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in a faction`)]});

    const newPoint = new Points();
    newPoint.value = points;
    newPoint.created = new Date();
    newPoint.member = member;

    await pointsRepository.save(newPoint);

    if (!member.points)
      member.points = [];
    
    member.totalPoints += points;
    member.points.push(newPoint);
    await memberRepository.save(member);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} changed ${user.username} points by ${points}`
    });
  
    await logRepository.save(newLog);

    let type = points > 0 ? 'been given' : 'lost';

    return interaction.editReply({ embeds: [embeds.successEmbed(`Gave Points`, `User ${user.username}, has ${type} ${points} points`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('change_points')
        .setDescription("Change a member's points")
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription("The member who's points you want to change")
            .setRequired(true)
          )
        .addNumberOption(option =>
          option
          .setName('points')
          .setDescription('How many points you want to change their points by')
          .setRequired(true)
        )
    );
  }
}