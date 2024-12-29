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
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const members = await memberRepository.find({
        relations: ['faction']
    });

    let total = 0;

    for(let member of members) {
      let memberDiscord = interaction.guild?.members.cache.get(member.discordId);

      if(!memberDiscord) {
        await memberRepository.delete(member);
        total++;
      }

      if(!memberDiscord?.roles.cache.has(`${process.env.MEMBER_ROLE}`)) {
        await memberRepository.delete(member);
        total++;
      }
    }

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} purged ${total} members`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Purged`, `You purged ${total} members`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('purge')
        .setDescription('Purge members who are not in the alliance')
    );
  }
}