"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFactionCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
const discord_js_1 = require("discord.js");
const faction_1 = __importDefault(require("../entities/faction"));
class CreateFactionCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['adminOnly']
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('name', true);
        const factionRepository = database.getRepository(faction_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const check = await factionRepository.exists({
            where: {
                name
            }
        });
        if (check)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction already exists`)] });
        try {
            const role = await interaction.guild?.roles.create({
                name: name,
                permissions: discord_js_1.PermissionFlagsBits.ViewChannel,
            });
            const newFaction = factionRepository.create({
                name: name,
                leaderId: '',
                roleId: role?.id,
            });
            await factionRepository.save(newFaction);
        }
        catch (err) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to create a role for ${name}`)] });
        }
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} created a new faction called: ${name}`
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Created ${name}`, `${name} has been created`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('create_faction')
            .setDescription('Create a faction in the server')
            .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the faction you want to create')
            .setRequired(true)));
    }
}
exports.CreateFactionCommand = CreateFactionCommand;
