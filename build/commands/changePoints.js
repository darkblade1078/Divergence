"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePointsCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const log_1 = __importDefault(require("../entities/log"));
const points_1 = __importDefault(require("../entities/points"));
class ChangePointsCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['adminOnly']
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const user = interaction.options.getUser('user', true);
        const points = interaction.options.getNumber('points', true);
        const memberRepository = database.getRepository(member_1.default);
        const pointsRepository = database.getRepository(points_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const member = await memberRepository.findOneBy({
            discordId: user.id
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in a faction`)] });
        const newPoint = new points_1.default();
        newPoint.value = points;
        newPoint.created = new Date();
        newPoint.member = member;
        await pointsRepository.save(newPoint);
        member.totalPoints += points;
        if (!member.points)
            member.points = [];
        member.points.push(newPoint);
        await memberRepository.save(member);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} changed ${user.username} points by ${points}`
        });
        await logRepository.save(newLog);
        let type = points > 0 ? 'been given' : 'lost';
        return interaction.editReply({ embeds: [embeds.successEmbed(`Gave Points`, `User ${user.username}, has ${type} ${points} points`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('change_points')
            .setDescription("Change a member's points")
            .addUserOption(option => option
            .setName('user')
            .setDescription("The member who's points you want to change")
            .setRequired(true))
            .addNumberOption(option => option
            .setName('points')
            .setDescription('How many points you want to change their points by')
            .setRequired(true)));
    }
}
exports.ChangePointsCommand = ChangePointsCommand;
