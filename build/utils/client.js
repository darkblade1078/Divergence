"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WardenClient = void 0;
require("reflect-metadata");
const framework_1 = require("@sapphire/framework");
const discord_js_1 = require("discord.js");
const database_1 = __importDefault(require("./database"));
const node_cron_1 = __importDefault(require("node-cron"));
const member_1 = __importDefault(require("../entities/member"));
const CLIENT_OPTIONS = {
    loadMessageCommandListeners: false,
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
    ],
};
class WardenClient extends framework_1.SapphireClient {
    constructor() {
        super(CLIENT_OPTIONS);
    }
    async login(token) {
        framework_1.container.database = await database_1.default.initialize();
        task.start();
        return super.login(token);
    }
    async destroy() {
        await framework_1.container.database.destroy();
        return super.destroy();
    }
}
exports.WardenClient = WardenClient;
const task = node_cron_1.default.schedule('0 0 * * *', () => {
    framework_1.container.database.getRepository(member_1.default).update({}, { loggedIn: false });
}, {
    scheduled: false
});
