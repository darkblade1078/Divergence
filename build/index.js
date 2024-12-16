"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./utils/client");
require("dotenv/config");
const client = new client_1.WardenClient();
client.login(process.env.DISCORD_BOT_TOKEN);
