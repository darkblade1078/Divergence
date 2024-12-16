import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { AutocompleteInteraction } from 'discord.js';
import House from '../entities/faction';

export class AutocompleteHandler extends InteractionHandler {
  public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
    super(ctx, {
      ...options,
      interactionHandlerType: InteractionHandlerTypes.Autocomplete
    });
  }

  public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) {
    return interaction.respond(result);
  }

  public override async parse(interaction: AutocompleteInteraction) {

    const { database } = this.container;

    const houseDatabase = database.getRepository(House);

    const searchResult = await  houseDatabase.find();

    if(searchResult)
      return this.some(searchResult.map((match) => ({ name: match.name, value: match.name })));

    return this.none();
  }
}