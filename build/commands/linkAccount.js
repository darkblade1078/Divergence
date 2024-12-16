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
        const embeds = new embeds_1.default(client);
        const member = await memberRepository.findOne({
            where: {
                discordId: interaction.user.id
            },
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`You're not in a faction`)] });
        const idCheck = await memberRepository.exists({
            where: {
                pnwID: id
            }
        });
        if (idCheck)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation already linked`)] });
        const api = new api_1.default();
        const nation = await api.getNationInfo(id);
        if (nation == null)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Nation does not exist`)] });
        member.pnwID = id;
        await memberRepository.save(member);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Linked`, `You have linked your pnw account`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('link_account')
            .setDescription('Link your pnw account to your discord account')
            .addUserOption(option => option
            .setName('id')
            .setDescription('Your PNW ID')
            .setRequired(true)));
    }
}
exports.LinkAccountCommand = LinkAccountCommand;
