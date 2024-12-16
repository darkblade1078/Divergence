"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogsCommand = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../utils/embeds"));
const log_1 = __importDefault(require("../entities/log"));
class LogsCommand extends framework_1.Command {
    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['adminOnly']
        });
    }
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const { client, database } = this.container;
        const logRepository = database.getRepository(log_1.default);
        const embeds = new embeds_1.default(client);
        let logs = (await logRepository.find()).reverse();
        return interaction.editReply({ embeds: [embeds.logsEmbed(logs)] });
    }
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => builder
            .setName('logs')
            .setDescription('Look at recent logs'));
    }
}
exports.LogsCommand = LogsCommand;
