import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Member from "../entities/member";
import Log from "../entities/log";
import { GuildMemberRoleManager } from "discord.js";
import Faction from "../entities/faction";

export class JoinFactionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options,
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('name', true);
    const factionRepository = database.getRepository(Faction);
    const memberRepository = database.getRepository(Member);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const faction = await factionRepository.findOneBy({
        name
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    const memberCheck = await memberRepository.exists({
        where: {
            discordId: interaction.user.id
        },
        relations: ['points']
    });

    if(memberCheck)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`You're already in a faction`)]});

    try {

      const newMember = memberRepository.create({
        discordId: interaction.user.id,
        totalPoints: 0,
        points: [],
        faction: faction,
        loggedIn: false
      });
    
      await memberRepository.save(newMember);

      const role = interaction.guild?.roles.cache.get(faction.roleId!);

      if(!role)
        return interaction.editReply({ embeds: [embeds.errorEmbed(`Role does not exist`)]});

      const memberRoles = interaction.member?.roles as GuildMemberRoleManager;

      await memberRoles.add(role);
    }
    catch(err) {
      console.log(err)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to join faction`)]});
    }

    const newLog = logRepository.create({
        date: new Date(),
        action: `${interaction.user.username} joined ${faction.name}`,
    });
  
    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Joined`, `You have joined faction ${faction.name}`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('join_faction')
        .setDescription('Join a faction')
        .addStringOption(option =>
          option
          .setName('name')
          .setDescription('The name of the faction you want to join')
          .setAutocomplete(true)
          .setRequired(true)
        )
    );
  }
}