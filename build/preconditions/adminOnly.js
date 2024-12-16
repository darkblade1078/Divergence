"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminOnlyPrecondition = void 0;
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
class AdminOnlyPrecondition extends framework_1.Precondition {
    async chatInputRun(interaction) {
        return this.CheckAdmin(interaction);
    }
    async CheckAdmin(interaction) {
        return interaction.memberPermissions?.has(discord_js_1.PermissionsBitField.Flags.Administrator)
            ? this.ok()
            : this.error({ message: 'Only server admins can use this command!' });
    }
}
exports.AdminOnlyPrecondition = AdminOnlyPrecondition;
