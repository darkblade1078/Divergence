import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Faction from "../entities/faction";
import { TextChannel } from "discord.js";

export class LoginCheckCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const factionName = interaction.options.getString('faction', true);
    const factionRepository = database.getRepository(Faction);
    const embeds = new embedGenerator(client);

    const faction = await factionRepository.findOne({
        where: {
          name: factionName
        },
        relations: ['members']
    });

    if(!faction)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)]});

    if(faction.leaderId != interaction.user.id)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`You are not the leader of this faction`)]});

    if(faction.members.length == 0)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`No members in faction`)]});

    let members: string[] = [];
    let memberString = ``;

    const filteredMembers = faction.members.filter(member => !member.loggedIn);

    if(filteredMembers.length == 0)
      return interaction.editReply({ embeds: [embeds.successEmbed(`All members have logged in`, `All members have logged in`)] });

    for(let i = 0; i < filteredMembers.length; i++) {

      const member = filteredMembers[i];
      memberString += `<@${member.discordId}>\n`;

      if(memberString.length > 600) {
        members.push(memberString);
        memberString = ``;
      }
      else if(i == filteredMembers.length - 1)
        members.push(memberString);
    }

    for(let i = 0; i < members.length; i++) {

      if(i == 0)
          interaction.editReply({ embeds: [embeds.successEmbed(`Members Who Haven't Logged In`, members[i])] });
      else {
          const channel = interaction.channel as TextChannel;
          channel.send({ embeds: [embeds.successEmbed(`Members Who Haven't Logged In ${i + 1}`, members[i])] });
      }
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('login_check')
        .setDescription("Check and see which members of a faction have logged in today")
        .addStringOption(option =>
            option
            .setName('faction')
            .setDescription('The faction you want to check')
            .setAutocomplete(true)
            .setRequired(true)
          )
    );
  }
}