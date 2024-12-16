import { DataSource } from 'typeorm';
import Faction from '../entities/faction';
import Member from '../entities/member';
import Points from '../entities/points';
import Log from '../entities/log';

const Database = new DataSource({
    type: "sqlite",
    database: 'database.sqlite',
    entities: [Faction, Member, Points, Log],
    synchronize: true,
});

export default Database;