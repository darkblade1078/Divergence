"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutocompleteHandler = void 0;
const framework_1 = require("@sapphire/framework");
const faction_1 = __importDefault(require("../entities/faction"));
class AutocompleteHandler extends framework_1.InteractionHandler {
    constructor(ctx, options) {
        super(ctx, {
            ...options,
            interactionHandlerType: framework_1.InteractionHandlerTypes.Autocomplete
        });
    }
    async run(interaction, result) {
        return interaction.respond(result);
    }
    async parse(interaction) {
        const { database } = this.container;
        const houseDatabase = database.getRepository(faction_1.default);
        const searchResult = await houseDatabase.find();
        if (searchResult)
            return this.some(searchResult.map((match) => ({ name: match.name, value: match.name })));
        return this.none();
    }
}
exports.AutocompleteHandler = AutocompleteHandler;
