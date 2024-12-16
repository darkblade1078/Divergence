import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import Log from "../entities/log";
import { GuildMemberRoleManager } from "discord.js";

export class LeaveFactionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const member = await memberRepository.findOne({
        where: {
            discordId: interaction.user.id
        },
        relations: ['faction']
    });

    if(!member)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)]});

    try {
    
      await memberRepository.delete(member);

      const role = interaction.guild?.roles.cache.get(member.faction.roleId!);

      if(!role)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Role does not exist`)]});

      const memberRoles = interaction.member?.roles as GuildMemberRoleManager;

      if(memberRoles.cache.has(role.id))
        await memberRoles.remove(role);
    }
    catch(err) {
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to leave faction`)]});
    }

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} left ${member.faction.name}`,
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Left`, `You have left ${member.faction.name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('leave_faction')
        .setDescription('Leave your current faction')
    );
  }
}