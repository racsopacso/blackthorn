import { SimpleActorSheet } from '../../../systems/worldbuilding/module/actor-sheet.js';

export class SwpActorSheet extends SimpleActorSheet {

  // SimpleActorSheet accomplishes most of what SwpActorSheet used to accomplish.
  // This class is mostly empty now aside from specific overrides as needed.

  /** @inheritdoc */
  constructor(...args) {
    super(...args);

    // Add a warning for the user if we have to do a replacement for legacy
    // inline roll syntax.
    const regex = /(\{\{)(\/[a-zA-Z]+\s)?([^\}]+)(\}\})/gi;
    if (this.document.system.biography.match(regex)) {
      console.warn(`Actor ${this.document.name} with ID ${this.document.id} uses the legcay {{rollFormula}} format in its sheet description. This should be updated to use [[rollFormula]] instead.`)
    };
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async getData(options) {
    const context = await super.getData(options);

    // Replace the legacy {{rollFormula}} syntax with core's [[rollFormula]].
    const regex = /(\{\{)(\/[a-zA-Z]+\s)?([^\}]+)(\}\})/gi;
    const bioReplaceBraces = context.systemData.biography.replace(regex, (match, p1, p2, p3, p4) => {
      return `[[${p2 ?? ''}${p3 ?? ''}]]`;
    });

    // Enrich the bio HTML and include actor roll data.
    context.biographyHTML = await TextEditor.enrichHTML(bioReplaceBraces, {
      secrets: this.document.isOwner,
      async: true,
      rollData: this.document.getRollData(),
    });
    return context;
  }

  /* -------------------------------------------- */

  /**
   * Override the item roll method.
   *
   * This override hotfixes a bug in the SWB system where actor attributes
   * referenced in an item formula cause fatal errors.
   *
   * @see https://github.com/foundryvtt/worldbuilding/issues/63
   *
   * @param {MouseEvent} event    The originating left click event
   */
  _onItemRoll(event) {
    let button = $(event.currentTarget);
    const li = button.parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    // Build our combined roll data using the actor roll data and
    // the specific item's roll data.
    const actorRollData = this.actor.getRollData();
    const rollData = Object.assign(
      actorRollData,
      actorRollData.items[item.name.slugify({strict: true})],
    );
    // Construct our roll formula and handle nested replacements.
    const rollFormula = Roll.replaceFormulaData(button.data('roll'), rollData);
    // Make the roll.
    let r = new Roll(rollFormula, rollData);
    return r.toMessage({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: `<h2>${item.name}</h2><h3>${button.text()}</h3>`
    });
  }

}