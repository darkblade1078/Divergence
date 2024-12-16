"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinFactionCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const log_1 = __importDefault(require("../entities/log"));
const faction_1 = __importDefault(require("../entities/faction"));
class JoinFactionCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('name', true);
        const factionRepository = database.getRepository(faction_1.default);
        const memberRepository = database.getRepository(member_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionRepository.findOneBy({
            name
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        const memberCheck = await memberRepository.exists({
            where: {
                discordId: interaction.user.id
            },
            relations: ['points']
        });
        if (memberCheck)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You're already in a faction`)] });
        try {
            const newMember = memberRepository.create({
                discordId: interaction.user.id,
                totalPoints: 0,
                points: [],
                faction: faction,
            });
            await memberRepository.save(newMember);
            const role = interaction.guild?.roles.cache.get(faction.roleId);
            if (!role)
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Role does not exist`)] });
            const memberRoles = interaction.member?.roles;
            await memberRoles.add(role);
        }
        catch (err) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to join faction`)] });
        }
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} joined ${faction.name}`,
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Joined`, `You have joined faction ${faction.name}`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('join_faction')
            .setDescription('Join a faction')
            .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the faction you want to join')
            .setAutocomplete(true)
            .setRequired(true)));
    }
}
exports.JoinFactionCommand = JoinFactionCommand;
