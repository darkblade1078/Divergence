import 'reflect-metadata';
import { container, SapphireClient } from '@sapphire/framework';
import { DataSource } from 'typeorm';
import { ClientOptions,  GatewayIntentBits } from 'discord.js';
import Database from './database';
import cron from 'node-cron';
import Member from '../entities/member';

const CLIENT_OPTIONS: ClientOptions = {
  loadMessageCommandListeners: false,
	intents: [
      GatewayIntentBits.Guilds, 
      GatewayIntentBits.GuildMembers,
	],
};

export class WardenClient extends SapphireClient {
  public constructor() {
    super(CLIENT_OPTIONS);
  }

  public override async login(token?: string) {
    container.database = await Database.initialize();
    task.start();
    return super.login(token);
  }

  public override async destroy() {
    await container.database.destroy();
    return super.destroy();
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    database: DataSource
  }
}

declare module '@sapphire/framework' {
  interface Preconditions {
    adminOnly: never;
    houseLeaderOnly: never;
  }
}

const task = cron.schedule('0 0 * * *', () =>  {
  container.database.getRepository(Member).update({}, { loggedIn: false });
}, {
  scheduled: false
});