"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMemberCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const log_1 = __importDefault(require("../entities/log"));
const faction_1 = __importDefault(require("../entities/faction"));
class RemoveMemberCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const user = interaction.options.getUser('user', true);
        const memberRepository = database.getRepository(member_1.default);
        const logRepository = database.getRepository(log_1.default);
        const factionDatabase = database.getRepository(faction_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionDatabase.findOne({
            where: {
                leaderId: interaction.user.id
            }
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Only faction leaders can use this command`)] });
        const member = await memberRepository.findOne({
            where: {
                discordId: user.id
            },
            relations: ['faction']
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in a faction`)] });
        if (member.faction.name != faction.name)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in your faction`)] });
        await memberRepository.delete(member);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} removed ${user.username} from ${faction.name}`
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Removed ${user.username}`, `User ${user.username}, has been removed from your faction`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('remove_member')
            .setDescription('Remove a member from a faction')
            .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to remove from your faction')
            .setRequired(true)));
    }
}
exports.RemoveMemberCommand = RemoveMemberCommand;
