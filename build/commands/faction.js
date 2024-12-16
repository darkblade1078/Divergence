"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactionCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const faction_1 = __importDefault(require("../entities/faction"));
class FactionCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const name = interaction.options.getString('faction', true);
        const factionRepository = database.getRepository(faction_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionRepository.findOne({
            where: {
                name
            },
            relations: ['members']
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        return interaction.editReply({ embeds: [embeds.factionEmbed(faction)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('faction')
            .setDescription('Get info on a faction')
            .addStringOption(option => option
            .setName('faction')
            .setDescription('The faction you want to lookup')
            .setAutocomplete(true)
            .setRequired(true)));
    }
}
exports.FactionCommand = FactionCommand;
