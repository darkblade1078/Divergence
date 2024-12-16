import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import Member from "../entities/member";
import Faction from "../entities/faction";

export class SetLeaderCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['adminOnly']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('faction', true);
    const user = interaction.options.getUser('user', true);
    const factionRepository = database.getRepository(Faction);
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const faction = await factionRepository.findOneBy({
        name
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    const member = await memberRepository.findOne({
        where: {
            discordId: user.id
        },
        relations: ['faction'],
    });

    if(!member)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in a faction`)]});

    if(member.faction.name != faction.name)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in ${faction.name}`)]});
    
    faction.leaderId == user.id;

    await factionRepository.save(faction);

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} made ${user.username} the leader of ${member.faction.name}`,
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Made Leader`, `${user.username} is now the leader of ${member.faction.name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('set_leader')
        .setDescription('Set the leader for a faction')
        .addStringOption(option =>
            option
            .setName('faction')
            .setDescription('The faction you want to set the leader for')
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addUserOption(option =>
            option
            .setName('user')
            .setDescription('The user you want to make leader')
            .setRequired(true)
        )
    );
  }
}