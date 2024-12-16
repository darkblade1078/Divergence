"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetFactionEmojiCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
const faction_1 = __importDefault(require("../entities/faction"));
class SetFactionEmojiCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('name', true);
        const emoji = interaction.options.getString('emoji', true);
        const logRepository = database.getRepository(log_1.default);
        const factionDatabase = database.getRepository(faction_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionDatabase.findOne({
            where: {
                name
            }
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        const unicodeEmojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu.test(emoji);
        const customEmojiRegex = /^<a?:\w+:\d+>$/.test(emoji);
        if (!customEmojiRegex && !unicodeEmojiRegex)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Inputted text is not an emoji`)] });
        faction.emoji = emoji;
        await factionDatabase.save(faction);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} set the emoji of ${faction?.name} to ${faction?.emoji}`
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Emoji Set`, `Set the emoji of ${faction?.name} to ${faction?.emoji}`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('set_faction_emoji')
            .setDescription('Set an emoji for a faction')
            .addStringOption(option => option
            .setName('name')
            .setDescription('The name of the faction you want to set the emoji for')
            .setAutocomplete(true)
            .setRequired(true))
            .addStringOption(option => option
            .setName('emoji')
            .setDescription('The emoji you want to set for the faction')
            .setRequired(true)));
    }
}
exports.SetFactionEmojiCommand = SetFactionEmojiCommand;
