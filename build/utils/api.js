"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pnwkit_2_0_1 = __importDefault(require("pnwkit-2.0"));
class API {
    constructor() {
        pnwkit_2_0_1.default.setKeys(`${process.env.PNW_API_KEY}`);
    }
    async getNationInfo(nationId) {
        const nation = await pnwkit_2_0_1.default.nationQuery({ id: [nationId], first: 1 }, `
            id
            last_active
            `);
        if (nation.length === 0)
            return null;
        return nation[0];
    }
}
exports.default = API;
