"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetLeaderCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
const member_1 = __importDefault(require("../entities/member"));
const faction_1 = __importDefault(require("../entities/faction"));
class SetLeaderCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['adminOnly']
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('faction', true);
        const user = interaction.options.getUser('user', true);
        const factionRepository = database.getRepository(faction_1.default);
        const memberRepository = database.getRepository(member_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionRepository.findOneBy({
            name
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        const member = await memberRepository.findOne({
            where: {
                discordId: user.id
            },
            relations: ['faction'],
        });
        if (!member)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in a faction`)] });
        if (member.faction.name != faction.name)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`User is not in ${faction.name}`)] });
        faction.leaderId == user.id;
        await factionRepository.save(faction);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} made ${user.username} the leader of ${member.faction.name}`,
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Made Leader`, `${user.username} is now the leader of ${member.faction.name}`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('set_leader')
            .setDescription('Set the leader for a faction')
            .addStringOption(option => option
            .setName('faction')
            .setDescription('The faction you want to set the leader for')
            .setAutocomplete(true)
            .setRequired(true))
            .addUserOption(option => option
            .setName('user')
            .setDescription('The user you want to make leader')
            .setRequired(true)));
    }
}
exports.SetLeaderCommand = SetLeaderCommand;
