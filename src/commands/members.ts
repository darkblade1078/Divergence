import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Faction from "../entities/faction";
import { TextChannel } from "discord.js";

export class MemberCommand extends Command {
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

    let members: string[] = [];
    let memberString = ``;

    for(let i = 0; i < faction.members.length; i++) {

        const member = faction.members[i];
        memberString += `<@${member.discordId}>\n`;

        if(memberString.length > 600) {
            members.push(memberString);
            memberString = ``;
        }
        else if(i == faction.members.length - 1)
            members.push(memberString);
    }

    for(let i = 0; i < members.length; i++) {

        if(i == 0)
            interaction.editReply({ embeds: [embeds.successEmbed(`${faction.name} members`, members[i])] });
        else {
            const channel = interaction.channel as TextChannel;
            channel.send({ embeds: [embeds.successEmbed(`${faction.name} members ${i + 1}`, members[i])] });
        }
    }
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('members')
        .setDescription('Get a list of members in a faction')
        .addStringOption(option =>
            option
            .setName('faction')
            .setDescription('The faction you want to lookup')
            .setAutocomplete(true)
            .setRequired(true)
        )
    );
  }
}