"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatInputCommandDenied = void 0;
const framework_1 = require("@sapphire/framework");
const embeds_1 = __importDefault(require("../../utils/embeds"));
class ChatInputCommandDenied extends framework_1.Listener {
    async run(error, { interaction }) {
        await interaction.deferReply({ ephemeral: true });
        const embeds = new embeds_1.default(this.container.client);
        return interaction.editReply({ embeds: [embeds.errorEmbed(error.message)] });
    }
}
exports.ChatInputCommandDenied = ChatInputCommandDenied;
