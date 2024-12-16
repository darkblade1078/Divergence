import { Command } from "@sapphire/framework";
import embedGenerator from "../utils/embeds";
import Log from "../entities/log";
import { PermissionFlagsBits } from "discord.js";
import Faction from "../entities/faction";

export class CreateFactionCommand extends Command {
  public constructor(context: Command.LoaderContext, options: Command.Options) {
    super(context, { 
      ...options, 
      preconditions: ['adminOnly']
    });
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const { client, database } = this.container;
    const name = interaction.options.getString('name', true);
    const factionRepository = database.getRepository(Faction);
    const logRepository = database.getRepository(Log);
    const embeds = new embedGenerator(client);

    const check = await factionRepository.exists({
      where: {
        name
      }
    });

    if(check)
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction already exists`)]});

    try {
      const role = await interaction.guild?.roles.create({
        name: name,
        permissions: PermissionFlagsBits.ViewChannel,
  
      });

      const newFaction = factionRepository.create({
        name: name,
        leaderId: '',
        roleId: role?.id,
      });

      await factionRepository.save(newFaction);
    }
    catch(err) {
      return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to create a role for ${name}`)]});
    }

    const newLog = logRepository.create({
      date: new Date(),
      action: `${interaction.user.username} created a new faction called: ${name}`
    });

    await logRepository.save(newLog);

    return interaction.editReply({ embeds: [embeds.successEmbed(`Created ${name}`, `${name} has been created`)] });
  }

  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName('create_faction')
        .setDescription('Create a faction in the server')
        .addStringOption(option =>
          option
          .setName('name')
          .setDescription('The name of the faction you want to create')
          .setRequired(true)
        )
    );
  }
}