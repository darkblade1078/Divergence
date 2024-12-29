import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import Log from "../entities/log";

export class RemoveMemberCommand extends Command {
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
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
          discordId: user.id
        },
        relations: ['faction']
    });

    if(!member)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in a faction`)]});

    if(member.faction.roleId != null) {

      const discordMember = interaction.guild?.members.cache.get(user.id);

      if(discordMember?.roles.cache.has(member.faction.roleId))
        await discordMember.roles.remove(member.faction.roleId);
    }

    await memberRepository.remove(member);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} removed ${user.username} from ${member.faction.name}`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Removed ${user.username}`, `User ${user.username} has been removed from ${member.faction.name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('remove_member')
        .setDescription('Remove a member from a faction')
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user you want to remove from your faction')
            .setRequired(true)
        )
    );
  }
}