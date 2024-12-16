"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFactionCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
const faction_1 = __importDefault(require("../entities/faction"));
class DeleteFactionCommand extends framework_1.Command {
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
        const factionRepository = database.getRepository(faction_1.default);
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        const faction = await factionRepository.findOneBy({
            name
        });
        if (!faction)
            return interaction.editReply({ embeds: [embeds.errorEmbed(`Faction does not exist`)] });
        await factionRepository.delete(faction);
        const newLog = logRepository.create({
            date: new Date(),
            action: `${interaction.user.username} deleted ${faction.name}`,
        });
        await logRepository.save(newLog);
        return interaction.editReply({ embeds: [embeds.successEmbed(`Deleted`, `${faction.name} is now the deleted`)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('delete_faction')
            .setDescription('Delete a faction')
            .addStringOption(option => option
            .setName('faction')
            .setDescription('The faction you want to delete')
            .setAutocomplete(true)
            .setRequired(true)));
    }
}
exports.DeleteFactionCommand = DeleteFactionCommand;
