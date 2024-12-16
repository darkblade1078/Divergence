import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import Log from "../entities/log";
import Faction from "../entities/faction";

export class RemoveMemberCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const user = interaction.options.getUser('user', true);
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const factionDatabase = database.getRepository(Faction);
    const embeds = new embedGenerator(client);

    const faction = await factionDatabase.findOne({
        where: {
            leaderId: interaction.user.id
        }
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Only faction leaders can use this command`)]});

    const member = await memberRepository.findOne({
        where: {
          discordId: user.id
        },
        relations: ['faction']
    });

    if(!member)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in a faction`)]});

    if(member.faction.name != faction.name)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in your faction`)]});

    await memberRepository.delete(member);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} removed ${user.username} from ${faction.name}`
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Removed ${user.username}`, `User ${user.username}, has been removed from your faction`)] });
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