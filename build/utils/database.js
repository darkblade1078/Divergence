"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const faction_1 = __importDefault(require("../entities/faction"));
const member_1 = __importDefault(require("../entities/member"));
const points_1 = __importDefault(require("../entities/points"));
const log_1 = __importDefault(require("../entities/log"));
const Database = new typeorm_1.DataSource({
    type: "sqlite",
    database: 'database.sqlite',
    entities: [faction_1.default, member_1.default, points_1.default, log_1.default],
    synchronize: true,
});
exports.default = Database;
