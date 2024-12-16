import { WardenClient } from './utils/client';
import 'dotenv/config';

const client = new WardenClient();

client.login(process.env.DISCORD_BOT_TOKEN);