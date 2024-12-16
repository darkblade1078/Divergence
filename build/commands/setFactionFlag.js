"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFactionFlagCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
const faction_1 = __importDefault(require("../entities/faction"));
class SetFactionFlagCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('name', true);
        const flag = interaction.options.getAttachment('flag', true);
        const logRepository = database.getRepository(log_1.default);
        const factionDatabase = database.getRepository(faction_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionDatabase.findOne({
            where: {
                name
            },
            relations: ['members']
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        if (!flag.url.includes('.png'))
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Image must be a png`)] });
        faction.flag = flag.url;
        await factionDatabase.save(faction);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} set the flag of ${faction?.name} to ${faction?.flag}`
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Flag Set`, `Set the flag of ${faction?.name} to ${faction?.flag}`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('set_faction_flag')
            .setDescription('Set an flag for a faction')
            .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the faction you want to set the flag for')
            .setAutocomplete(true)
            .setRequired(true))
            .addAttachmentOption(option => option
            .setName('flag')
            .setDescription('The flag you want to set for the faction')
            .setRequired(true)));
    }
}
exports.SetFactionFlagCommand = SetFactionFlagCommand;
