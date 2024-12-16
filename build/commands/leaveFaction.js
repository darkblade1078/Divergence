"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveFactionCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const log_1 = __importDefault(require("../entities/log"));
class LeaveFactionCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const memberRepository = database.getRepository(member_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const member = await memberRepository.findOne({
            where: {
                discordId: interaction.user.id
            },
            relations: ['faction']
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)] });
        try {
            await memberRepository.delete(member);
            const role = interaction.guild?.roles.cache.get(member.faction.roleId);
            if (!role)
                return interaction.editReply({ embeds: [embeds.errorEmbed(`Role does not exist`)] });
            const memberRoles = interaction.member?.roles;
            if (memberRoles.cache.has(role.id))
                await memberRoles.remove(role);
        }
        catch (err) {
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Failed to leave faction`)] });
        }
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} left ${member.faction.name}`,
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Left`, `You have left ${member.faction.name}`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('leave_faction')
            .setDescription('Leave your current faction'));
    }
}
exports.LeaveFactionCommand = LeaveFactionCommand;
