"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardCommand = void 0;
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const plugin_subcommands_1 = require("@sapphire/plugin-subcommands");
const date_fns_1 = require("date-fns");
const faction_1 = __importDefault(require("../entities/faction"));
class LeaderboardCommand extends plugin_subcommands_1.Subcommand {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'leaderboard',
            subcommands: [
                {
                    name: 'members',
                    chatInputRun: 'chatInputMembers'
                },
                {
                    name: 'factions',
                    chatInputRun: 'chatInputFactions'
                },
            ]
        });
    }
    getDateRange(type) {
        const now = new Date();
        const month = now.getMonth() + 1;
        let start;
        let end;
        switch (type) {
            case "Weekly":
                start = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 0 });
                end = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 0 });
                break;
            case "Monthly":
                start = (0, date_fns_1.startOfMonth)(now);
                end = (0, date_fns_1.endOfMonth)(now);
                break;
            case "Triannually":
                if (month >= 1 && month <= 4) {
                    start = new Date(now.getFullYear(), 0, 1);
                    end = new Date(now.getFullYear(), 3, 30);
                }
                else if (month >= 5 && month <= 8) {
                    start = new Date(now.getFullYear(), 4, 1);
                    end = new Date(now.getFullYear(), 7, 31);
                }
                else {
                    start = new Date(now.getFullYear(), 8, 1);
                    end = new Date(now.getFullYear(), 11, 31);
                }
                break;
            case 'Yearly':
                start = (0, date_fns_1.startOfYear)(now);
                end = (0, date_fns_1.endOfYear)(now);
                break;
            default:
                throw new Error(`Invalid type: ${type}`);
        }
        return { start, end };
    }
    async chatInputMembers(interaction) {
        await interaction.deferReply();
        const { database, client } = this.container;
        const embeds = new embeds_1.default(client);
        const type = interaction.options.getString('type', true);
        const factionName = interaction.options.getString('faction', false);
        const memberRepository = database.getRepository(member_1.default);
        const members = await memberRepository.find({ relations: ['faction', 'points'] });
        if (members.length === 0) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`There are no members currently`)] });
        }
        const { start, end } = this.getDateRange(type);
        const filteredMembers = factionName ? members.filter(member => member.faction.name === factionName) : members;
        const sortedMembers = filteredMembers.map(member => {
            const totalPoints = member.points
                .filter(point => (0, date_fns_1.isWithinInterval)(typeof point.created === 'string' ? (0, date_fns_1.parseISO)(point.created) : point.created, { start, end }))
                .reduce((sum, point) => sum + point.value, 0);
            return {
                discordId: member.discordId,
                faction: member.faction.name,
                emoji: member.faction.emoji || '',
                points: totalPoints,
            };
        }).sort((a, b) => b.points - a.points);
        if (sortedMembers.length === 0) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`There are no members who have earned points during the specified time`)] });
        }
        return interaction.editReply({ embeds: [embeds.memberRankingsEmbed(interaction, type, sortedMembers)] });
    }
    async chatInputFactions(interaction) {
        await interaction.deferReply();
        const { database, client } = this.container;
        const embeds = new embeds_1.default(client);
        const type = interaction.options.getString('type', true);
        const factionRepository = database.getRepository(faction_1.default);
        const factions = await factionRepository.find({ relations: ['members', 'members.points'] });
        if (factions.length === 0) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`There are no factions currently`)] });
        }
        const { start, end } = this.getDateRange(type);
        const sortedFactions = factions.map(faction => {
            const totalPoints = faction.members.reduce((sum, member) => {
                const memberPoints = member.points
                    .filter(point => (0, date_fns_1.isWithinInterval)(typeof point.created === 'string' ? (0, date_fns_1.parseISO)(point.created) : point.created, { start, end }))
                    .reduce((memberSum, point) => memberSum + point.value, 0);
                return sum + memberPoints;
            }, 0);
            return {
                name: faction.name,
                emoji: faction.emoji || '',
                totalPoints,
            };
        }).sort((a, b) => b.totalPoints - a.totalPoints);
        return interaction.editReply({ embeds: [embeds.factionRankingsEmbed(type, sortedFactions)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder => builder
            .setName('leaderboard')
            .setDescription('Get the current leaderboard')
            .addSubcommand(command => command
            .setName('members')
            .setDescription('Get member rankings')
            .addStringOption(option => option
            .setName('type')
            .setDescription('The type of leaderboard you want')
            .addChoices({ name: 'Weekly', value: 'Weekly' }, { name: 'Monthly', value: 'Monthly' }, { name: 'Triannually', value: 'Triannually' }, { name: 'Yearly', value: 'Yearly' })
            .setRequired(true))
            .addStringOption(option => option
            .setName('faction')
            .setDescription('Get rankings within a faction')
            .setAutocomplete(true)))
            .addSubcommand(command => command
            .setName('factions')
            .setDescription('Get faction rankings')
            .addStringOption(option => option
            .setName('type')
            .setDescription('The type of leaderboard you want')
            .addChoices({ name: 'Weekly', value: 'Weekly' }, { name: 'Monthly', value: 'Monthly' }, { name: 'Triannually', value: 'Triannually' }, { name: 'Yearly', value: 'Yearly' })
            .setRequired(true))));
    }
}
exports.LeaderboardCommand = LeaderboardCommand;
