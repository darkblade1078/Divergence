"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const member_1 = __importDefault(require("../entities/member"));
class MemberCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const user = interaction.options.getUser('member', true);
        const memberRepository = database.getRepository(member_1.default);
        const embeds = new embeds_1.default(client);
        const member = await memberRepository.findOne({
            where: {
                discordId: user.id
            },
            relations: ['faction']
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Member is not in a faction`)] });
        return interaction.editReply({ embeds: [embeds.memberEmbed(user, member)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('member')
            .setDescription('Get info on a member')
            .addUserOption(option => option
            .setName('member')
            .setDescription('The member you want to lookup')
            .setRequired(true)));
    }
}
exports.MemberCommand = MemberCommand;
