"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkAccountCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
const api_1 = __importDefault(require("../utils/api"));
const points_1 = __importDefault(require("../entities/points"));
class LinkAccountCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const id = interaction.options.getNumber('id', true);
        const memberRepository = database.getRepository(member_1.default);
        const pointsRepository = database.getRepository(points_1.default);
        const embeds = new embeds_1.default(client);
        const member = await memberRepository.findOne({
            where: {
                discordId: interaction.user.id
            },
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)] });
        if (member.loggedIn)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You already logged in for today`)] });
        const api = new api_1.default();
        const nation = await api.getNationInfo(id);
        if (nation == null)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation does not exist`)] });
        const currentDate = new Date();
        const nationLoginDate = new Date(nation.last_active);
        const currentDateUTC = new Date(currentDate.toISOString());
        const twentyFourHoursAgo = new Date(currentDateUTC.getTime() - 24 * 60 * 60 * 1000);
        if (nationLoginDate < twentyFourHoursAgo)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You haven't logged in within the last 24 hours`)] });
        const newPoint = new points_1.default();
        newPoint.value = 5;
        newPoint.created = new Date();
        newPoint.member = member;
        await pointsRepository.save(newPoint);
        member.totalPoints += 5;
        if (!member.points)
            member.points = [];
        member.loggedIn = true;
        await memberRepository.save(member);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Logged In`, `You have logged in and earned **5** points`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('login')
            .setDescription('Verify that you logged in to earn points'));
    }
}
exports.LinkAccountCommand = LinkAccountCommand;
