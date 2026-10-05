import { LootSheetActions } from "./actions.mjs";
import { LootSheetConstants } from "./constants.mjs";
import { QuantityDialog } from "./dialogs/quantity-dialog.mjs";
import { priceModifierDialog } from "./dialogs/price-modifier-dialog.mjs";
import { convertLootDialog } from "./dialogs/convert-loot-dialog.mjs";
import { lootTokensDialog } from "./dialogs/loot-token-dialog.mjs";

export class LootSheetPf1NPC extends pf1.applications.actor.ActorSheetPFNPC {
  static DEFAULT_TOKEN = "icons/svg/mystery-man.svg";

  get template() {
    return "modules/lootsheetnpcpf1/templates/npc-sheet.hbs";
  }

  static get defaultOptions() {
    const options = super.defaultOptions;

    foundry.utils.mergeObject(options, {
      classes: ["pf1 sheet actor npc npc-sheet loot-sheet-npc"],
      width: 850,
      height: 768,
      scrollY: [".gm-settings", ".features", ".sheet-sidebar", ".inventory-body"],
      dragDrop: [
        { dragSelector: ".item-name" },
        { dragSelector: ".item-name", dropSelector: ".features" },
        { dragSelector: ".item-name", dropSelector: ".inventory-body" },
      ],
    });
    return options;
  }

  /**
   * Returns the loot price that the player is aware of
   *
   * @param {object} item  The item to get the price of
   * @returns {number}  The price of the item
   */
  getLootPrice(item) {
    if (game.user.isGM || item.identified || item.system?.identified) {
      if (item.system) return item.system.price.value ?? item.system.price;
      else return item.price.value ?? item.price;
    }
    return LootSheetActions.getItemCost(item) * (item.system?.quantity ?? item.quantity);
  }

  /**
   * Returns the loot name that the player knows
   *
   * @param {object} item  The item to get the name of
   * @returns {string}  The name of the item
   */
  getLootName(item) {
    if (game.user.isGM || item.identified || item.system?.identified) {
      if (item.system) return item.system.name;
      else return item.name;
    }
    return LootSheetActions.getItemName(item);
  }

  async getData() {
    console.log("Loot Sheet | getData");

    const context = await super.getData();

    // https://foundryvtt.wiki/en/migrations/foundry-core-0_8_x
    context.flags = context.actor.flags;

    // Prepare GM Settings
    context.flags.loot = await this._prepareGMSettings(context.actor);

    let lootsheettype = await this.actor.getFlag(LootSheetConstants.MODULENAME, "lootsheettype");
    if (!lootsheettype) {
      lootsheettype = "Loot";
      await this.actor.setFlag(LootSheetConstants.MODULENAME, "lootsheettype", lootsheettype);
    }

    const dropEnabled = await this.actor.getFlag(LootSheetConstants.MODULENAME, "dropEnabled");
    if (dropEnabled === undefined) {
      await this.actor.setFlag(LootSheetConstants.MODULENAME, "dropEnabled", false);
    }

    context.priceModifier = 1.0;
    if (lootsheettype === "Merchant") {
      context.priceModifier = await this.actor.getFlag(LootSheetConstants.MODULENAME, "priceModifier");
      if (!context.priceModifier) {
        await this.actor.setFlag(LootSheetConstants.MODULENAME, "priceModifier", 1.0);
        context.priceModifier = 1.0;
      }
    }

    context.totalItems = 0;
    context.totalWeight = 0;
    context.totalPrice = 0;
    context.adjustedPrice = 0;
    context.maxItems = (await this.actor.getFlag(LootSheetConstants.MODULENAME, "maxCapacity")) || 0;
    context.maxWeight = (await this.actor.getFlag(LootSheetConstants.MODULENAME, "maxLoad")) || 0;
    context.saleValue = Math.max(0, (await this.actor.getFlag(LootSheetConstants.MODULENAME, "saleValue")) || 50);
    context.displaySaleValueEnabled = await this.actor.getFlag(
      LootSheetConstants.MODULENAME,
      "displaySaleValueEnabled"
    );

    context.inventory.forEach((section) =>
      section.items?.forEach((i) => {
        // specify if empty
        const itemQuantity = i.quantity ?? 1;
        const itemCharges = i.uses?.value ?? 1;
        i.empty = itemQuantity <= 0 || (i.isCharged && itemCharges <= 0);

        if (i.quantity && i.items && Object.keys(i.items).length) {
          Object.values(i.items).forEach((item) => (context.totalPrice += LootSheetActions.getItemCost(item)));
        }
        context.totalItems += itemQuantity;

        context.totalWeight += i.weight.converted.total;
        context.totalPrice += LootSheetActions.getItemCost(i);
        context.adjustedPrice += LootSheetActions.getItemSaleValue(i, context.saleValue / 100);
      })
    );

    context.lootsheettype = lootsheettype;
    context.lootsheetTypeOptions = {
      Loot: game.i18n.localize("ls.typeLoot"),
      Merchant: game.i18n.localize("ls.typeMerchant"),
    };

    context.rolltable = await this.actor.getFlag(LootSheetConstants.MODULENAME, "rolltable");
    //console.log(`Loot Sheet | Rolltable = ${rolltable}`);
    context.rolltables = game.tables.contents.reduce((acc, table) => {
      acc[table.name] = table.name;
      return acc;
    }, {});

    context.canAct =
      context.isGM ||
      (game.userId in context.actor.ownership &&
        context.actor.ownership[game.userId] == CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER);
    context.itemsWarning = context.maxItems <= 0 || context.maxItems >= context.totalItems ? "" : "warn";
    context.totalWeight = Math.ceil(context.totalWeight);
    context.weightWarning = context.maxWeight <= 0 || context.maxWeight >= context.totalWeight ? "" : "warn";

    context.hasCurrency = Object.values(this.actor.system.currency).some((e3) => e3 > 0);
    context.hasAltCurrency = Object.values(this.actor.system.altCurrency).some((e3) => e3 > 0);

    // Return data for rendering
    const totalValue = pf1.utils.currency.split(context.totalPrice * 100, { pad: true });
    totalValue.cp = Math.round(totalValue.cp);
    context.labels.totalValue = game.i18n.format("PF1.SplitValue", totalValue);

    const sellValue = pf1.utils.currency.split(context.adjustedPrice * 100, { pad: true });
    sellValue.cp = Math.round(sellValue.cp);
    context.labels.sellValue = game.i18n.format("PF1.SplitValue", sellValue);
    return context;
  }

  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   *
   * @param {jquery} html   The prepared HTML object ready to be rendered into the DOM
   */
  async activateListeners(html) {
    console.debug("Loot Sheet | activateListeners");
    super.activateListeners(html);

    const dragEnabled = await this.actor.getFlag(LootSheetConstants.MODULENAME, "dragEnabled");
    if (!dragEnabled) {
      // Remove dragging capability
      const handler = (ev) => this._onDragItemStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", false);
        li.removeEventListener("dragstart", handler);
      });
    }
    // Change Actor
    html.find(".default-actor-selector").each((i, select) => {
      const userId = select.name.split(".")[3];
      if (userId === game.userId && this.actor.ownership[userId] > CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED)
        select.disabled = false;

      select.addEventListener("change", (ev) => this._onDefaultActorChange(ev));
    });

    if (this.options.editable) {
      // Toggle Permissions
      html.find(".permission-proficiency").click((ev) => this._onCyclePermissionProficiency(ev));

      // Toggle Permissions (batch)
      html.find(".permission-batch").click((ev) => this._onBatchPermissionChange(ev));

      // Split Coins
      html.find(".split-coins").click((ev) => this._distributeCoins(ev));

      // Price Modifier
      html.find(".price-modifier").click((ev) => this._priceModifier(ev));

      // Convert Loot
      html.find(".convert-loot").click((ev) => this._convertLoot(ev));
      // Collect Loot
      html.find(".collect-loot").click((ev) => this._collectLoot(ev));

      //html.find('.merchant-settings').change(ev => this._merchantSettingChange(ev));
      html.find(".update-inventory").click((ev) => this._merchantInventoryUpdate(ev));

      // Drag Enabled?
      html.find("[name=flagDragEnabled]").click((ev) => this._toggleFlag(ev, "dragEnabled"));

      // Drop Enabled?
      html.find("[name=flagDropEnabled]").click((ev) => this._toggleFlag(ev, "dropEnabled"));

      // Max inventory space
      html.find("[name=flagMaxCapacity]").change((ev) => this._changeFlag(ev, "maxCapacity"));

      // Max inventory weight
      html.find("[name=flagMaxLoad]").change((ev) => this._changeFlag(ev, "maxLoad"));

      // Sale percentage (default 50)
      html.find("[name=flagSaleValue]").change((ev) => this._changeFlag(ev, "saleValue"));

      // Display Sale Value?
      html.find("[name=flagDisplaySaleValueEnabled]").click((ev) => this._toggleFlag(ev, "displaySaleValueEnabled"));
    }

    // Buy Item
    html.find(".item-buy").click((ev) => this._takeItem(ev));

    // Loot Item
    html.find(".item-loot").click((ev) => this._takeItem(ev));

    // Toggle Visibility
    html.find(".item-visibility").click((ev) => this._toggleVisibility(ev));

    // Infinite quantity
    html.find(".item-quantity-infinite").click((ev) => this._toggleInfiniteQuantity(ev));
  }

  /* -------------------------------------------- */

  /**
   * Handle loot sheet flag toggles
   *
   * @param {Event} event  The originating click event
   * @param {string} flag   The target flag to toggle
   * @private
   */
  async _toggleFlag(event, flag) {
    this.actor.setFlag(LootSheetConstants.MODULENAME, flag, event.target?.checked ?? true);
  }

  /**
   * Handle loot sheet flag text fields
   *
   * @param {Event} event The originating click event
   * @param {string} flag The target flag to toggle
   * @private
   */
  async _changeFlag(event, flag) {
    console.debug("event is ", event);
    this.actor.setFlag(LootSheetConstants.MODULENAME, flag, event.target?.value ?? "");
  }

  /* -------------------------------------------- */
  /*  Form Submission                             */
  /* -------------------------------------------- */

  async _updateObject(event, formData) {
    return super._updateObject(event, formData);
  }

  /**
   * Required because PF1 _onSubmit tries to updateItems too,
   * which blocks close operation and does other side effects
   *
   * @param {Event} event - the event that triggered the submit
   * @param {object} [options] - additional options
   * @param {object} [options.updateData] - additional data to update
   * @param {boolean} [options.preventClose] - prevent the sheet from closing after the submit
   * @param {boolean} [options.preventRender] - prevent the sheet from rendering after the submit
   * @returns {Promise<void>}
   * @private
   */
  async _onSubmit(event, { updateData = null, preventClose = false, preventRender = false } = {}) {
    event.preventDefault();
    this._submitQueued = false;
    await super._onSubmit(event, { updateData, preventClose, preventRender });
  }

  /* -------------------------------------------- */

  /**
   * Handle merchant inventory update
   *
   * @param {Event} event - the event that triggered the submit
   * @param {jquery} _html  - the originating click event
   * @returns {Promise<void>}
   * @private
   */
  async _merchantInventoryUpdate(event, _html) {
    event.preventDefault();
    //console.log("Loot Sheet | _merchantInventoryUpdate")

    if (!game.user.isGM) {
      return;
    }

    const rolltableName = await this.actor.getFlag(LootSheetConstants.MODULENAME, "rolltable");
    const shopQtyFormula = (await this.actor.getFlag(LootSheetConstants.MODULENAME, "shopQty")) || "1";
    const itemQtyFormula = (await this.actor.getFlag(LootSheetConstants.MODULENAME, "itemQty")) || "1";

    if (!rolltableName || rolltableName.length == 0) {
      return ui.notifications.error(game.i18n.format("ERROR.lsChooseTable"));
    }

    const rolltable = game.tables.getName(rolltableName);
    if (!rolltable) {
      console.log(`Loot Sheet | No Rollable Table found with name "${rolltableName}".`);
      return ui.notifications.error(game.i18n.format("ERROR.lsNoRollableTableFound", { name: rolltableName }));
    }

    const clearInventory = game.settings.get(LootSheetConstants.MODULENAME, "clearInventory");

    if (clearInventory) {
      const currentItems = this.actor.items.map((i) => i._id);
      await this.actor.deleteEmbeddedDocuments("Item", currentItems);
    }
    //return;
    const shopQtyRoll = new Roll(shopQtyFormula);

    await shopQtyRoll.roll();
    console.log(`Loot Sheet | Adding ${shopQtyRoll.result} new items`);

    const newItems = {};

    for (let i = 0; i < shopQtyRoll.result; i++) {
      const rollResult = await rolltable.roll();
      console.log(rollResult);
      const rollResultData = rollResult.results[0];
      let newItem = game.items.get(rollResultData.documentId);
      if (!newItem || newItem === null) {
        const pack = game.packs.get(rollResultData.documentCollection);
        if (pack) {
          newItem = await pack.getDocument(rollResultData.documentId);
        }

        if (!newItem || newItem === null) {
          console.log(`Loot Sheet | No item found "${rollResultData.resultId}" - "${rollResultData.text}".`);
          ui.notifications.error(`No item found "${rollResultData.resultId}" - "${rollResultData.text}".`);
          continue;
        }
      }

      const itemQtyRoll = new Roll(itemQtyFormula);
      await itemQtyRoll.roll();
      console.log(`Loot Sheet | Adding ${itemQtyRoll.result} x ${newItem.name}`);
      const newData = newItem.toJSON();

      if (newItems[newData._id]) newItems[newData._id].system.quantity += Number(itemQtyRoll.result);
      else {
        newData.system.quantity = Number(itemQtyRoll.result);
        newItems[newData._id] = newData;
      }
    }

    await this.actor.createEmbeddedDocuments("Item", Object.values(newItems));
  }

  /* -------------------------------------------- */

  _onDefaultActorChange(event) {
    const userId = event.currentTarget.name.split(".")[3];
    const actorId = event.currentTarget.value;
    if (game.user.isGM) {
      this.actor.setFlag(LootSheetConstants.MODULENAME, `playerIds.${userId}`, actorId);
    } else if (userId === game.userId) {
      const targetGM = game.users.find((u) => u.isGM && u.active);
      game.socket.emit(LootSheetConstants.SOCKET, {
        type: "defaultActorChange",
        userId,
        actorId,
        processorId: targetGM?.id,
        targetUUID: this.actor.uuid,
      });
    }
  }

  /* -------------------------------------------- */

  async _takeItem(event) {
    event.preventDefault();

    const targetGM = game.users.find((u) => u.isGM && u.active && u.viewedScene === game.user.viewedScene);

    if (!targetGM) {
      return ui.notifications.error(game.i18n.localize("ERROR.lsNoActiveGM"));
    }
    const sourceActorId = this.actor.getFlag(LootSheetConstants.MODULENAME, `playerIds.${game.userId}`);
    const sourceActor = sourceActorId ? game.actors.get(sourceActorId) : null;

    const op = event.currentTarget.dataset.op;
    if (sourceActor) {
      const itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      const quantity = Number($(event.currentTarget).parents(".item").attr("data-item-quantity"));
      const itemName = $(event.currentTarget).parents(".item").find("h4").text();

      const options = {
        acceptLabel: game.i18n.localize("ls." + (op === "loot" ? "loot" : "purchase")),
        initial: quantity,
        total: quantity,
      };
      if (quantity == 1) {
        options.title = game.i18n.localize("ls." + (op === "loot" ? "loot" : "purchase"));
        options.label = game.i18n.format(`ls.${op}Content`, { item: itemName });
        options.quantity = 1;
      } else {
        options.title = game.i18n.format(`ls.${op}Title`, { item: itemName });
      }
      await QuantityDialog.wait(options, (quantity, stacking) => {
        const packet = {
          type: op,
          userId: game.userId,
          sourceUUID: sourceActor.uuid,
          targetUUID: this.actor.uuid,
          itemId,
          quantity,
          stacking,
          processorId: targetGM.id,
        };
        console.log("LootSheetPf1", `Sending ${op} request to ${targetGM.name}`, packet);
        game.socket.emit(LootSheetConstants.SOCKET, packet);
      });
    } else {
      console.log(`Loot Sheet | ${game.i18n.localize("ERROR.lsNoActiveCharacter")}`);
      return ui.notifications.error(game.i18n.localize("ERROR.lsNoActiveCharacter"));
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle price modifier.
   *
   * @param {Event} event - the event that triggered the submit
   * @returns {void|Promise<void>} - returns nothing, or a promise of nothing
   * @private
   */
  async _priceModifier(event) {
    event.preventDefault();
    //console.log("Loot Sheet | _priceModifier")

    let priceModifier = await this.actor.getFlag(LootSheetConstants.MODULENAME, "priceModifier");
    if (!priceModifier) priceModifier = 1.0;

    priceModifier = Math.round(priceModifier * 100);

    await priceModifierDialog(priceModifier, this.actor);
  }

  /* -------------------------------------------- */

  /**
   * Handle buy item
   *
   * @param {Event} event - the event that triggered the submit
   * @returns {void|Promise<void>} - returns nothing, or a promise of nothing
   * @private
   */
  _toggleVisibility(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
    const item = this.actor.items.get(itemId);
    if (item) {
      if (!item.getFlag(LootSheetConstants.MODULENAME, "secret")) {
        item.setFlag(LootSheetConstants.MODULENAME, "secret", true);
      } else {
        //item.setFlag(LootSheetConstants.MODULENAME, "secret", false);
        // unset flag doesn't work???
        item.unsetFlag(LootSheetConstants.MODULENAME, "secret");
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle infinite quantity
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  _toggleInfiniteQuantity(event) {
    event.preventDefault();
    const itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
    const item = this.actor.items.get(itemId);
    if (item) {
      if (!item.getFlag(LootSheetConstants.MODULENAME, "infinite")) {
        item.setFlag(LootSheetConstants.MODULENAME, "infinite", true);
      } else {
        item.unsetFlag(LootSheetConstants.MODULENAME, "infinite");
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle conversion to loot. This function converts (and removes) all items
   * on the Loot Sheet into coins. Items are sold according to the normal rule
   * (50% or 100% for trade goods). Price is rounded. Unidentified items are
   * sold according to their unidentified price.
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  async _convertLoot(event) {
    event.preventDefault();
    //console.log("Loot Sheet | _convertLoot")

    await convertLootDialog(this.actor);
  }

  /**
   * Handle the collection of loot from tokens. For every selected token,
   * the loot sheet will gather up any inventory items they possess.
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  async _collectLoot(event) {
    event.preventDefault();
    //console.log("Loot Sheet | _collectLoot")

    const actors = canvas.tokens.controlled.map((token) => token.actor).filter((_) => _);
    if (!actors.length) {
      ui.notifications.warn(game.i18n.localize("ERROR.lsCollectLoot"));
      return;
    }
    const lootActor = this.actor;
    const deleteLoot = game.settings.get(LootSheetConstants.MODULENAME, "deleteLootedActors");

    await lootTokensDialog(lootActor, actors, deleteLoot);
  }

  /* -------------------------------------------- */

  /**
   * Handle distribution of coins. This function splits all coins
   * into all characters/players that have "act" permissions.
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  async _distributeCoins(event) {
    event.preventDefault();
    //console.log("Loot Sheet | Split Coins clicked");

    const actorData = this.actor;
    const owners = [];
    //console.log("Loot Sheet | actorData", actorData);
    // Calculate owners
    for (const u in actorData.ownership) {
      if (u != "default" && actorData.ownership[u] == CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
        //console.log("Loot Sheet | u in actorData.ownership", u);
        const player = game.users.get(u);
        if (player) {
          //console.log("Loot Sheet | player", player);
          const defaultActorId = actorData.getFlag(LootSheetConstants.MODULENAME, `playerIds.${u}`);
          const actor = defaultActorId ? game.actors.get(defaultActorId) : null;
          //console.log("Loot Sheet | actor", actor);
          if (actor && (player.role === CONST.USER_ROLES.PLAYER || player.role === CONST.USER_ROLES.TRUSTED))
            owners.push([player, actor]);
        }
      }
    }

    //console.log("Loot Sheet | owners", owners);
    if (owners.length === 0) return;

    // Calculate split of currency
    const currencySplit = foundry.utils.duplicate(actorData.system.currency);
    const altCurrencySplit = foundry.utils.duplicate(actorData.system.altCurrency);
    const currencyRemains = foundry.utils.duplicate(actorData.system.currency);
    const altCurrencyRemains = foundry.utils.duplicate(actorData.system.altCurrency);
    //console.log("Loot Sheet | Currency data", currencySplit);
    for (const c in currencySplit) {
      if (owners.length) {
        currencySplit[c] = Math.floor(currencySplit[c] / owners.length);
        altCurrencySplit[c] = Math.floor(altCurrencySplit[c] / owners.length);
      } else {
        currencySplit[c] = 0;
        altCurrencySplit[c] = 0;
      }

      currencyRemains[c] -= currencySplit[c] * owners.length;
      altCurrencyRemains[c] -= altCurrencySplit[c] * owners.length;
    }

    let msg = [];
    for (const u of owners) {
      //console.log("Loot Sheet | u of owners", u);
      if (u === null) continue;

      msg = [];
      //console.log(u)
      const [player, actor] = u;

      const currency = actor.system.currency;
      const altCurrency = actor.system.altCurrency;
      const newCurrency = foundry.utils.duplicate(actor.system.currency);
      const newAltCurrency = foundry.utils.duplicate(actor.system.altCurrency);

      //console.log("Loot Sheet | Current Currency", currency);
      for (const c in currency) {
        if (currencySplit[c]) {
          msg.push(
            game.i18n.format("ls.splitcoins", { quantity: currencySplit[c], currency: game.i18n.localize("ls." + c) })
          );
          newCurrency[c] = currency[c] + currencySplit[c];
        }
        if (altCurrencySplit[c]) {
          msg.push(
            game.i18n.format("ls.splitcoins", {
              quantity: altCurrencySplit[c],
              currency: game.i18n.localize(`ls.wl_${c}`),
            })
          );
          newAltCurrency[c] = altCurrency[c] + altCurrencySplit[c];
        }
      }

      // Increase currency for players
      await actor.update({ "system.currency": newCurrency, "system.altCurrency": newAltCurrency });
      Hooks.callAll("LootSheetNPC.DistributeCoins", {
        user: player,
        actor: actor,
        currency: currencySplit,
      });

      // Remove currency from loot actor.
      this.actor.update({ "system.currency": currencyRemains, "system.altCurrency": altCurrencyRemains });

      // Create chat message for coins received
      if (msg.length != 0) {
        let message = game.i18n.format("ls.receives", { actor: actor.name });
        message += msg.join(",");
        ChatMessage.create({
          author: game.userId,
          speaker: {
            actor: this.actor,
            alias: this.actor.name,
          },
          content: message,
        });
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Handle cycling permissions for a player
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  _onCyclePermissionProficiency(event) {
    event.preventDefault();
    //console.log("Loot Sheet | this.actor.ownership", this.actor.ownership);

    const field = $(event.currentTarget).siblings('input[type="hidden"]');

    let level = parseFloat(field.val());
    if (!level) level = 0;

    //console.log("Loot Sheet | current level " + level);

    const levels = [0, 1, 2]; //const levels = [0, 2, 3];

    const idx = levels.indexOf(level),
      newLevel = levels[idx === levels.length - 1 ? 0 : idx + 1];

    //console.log("Loot Sheet | new level " + newLevel);

    const userId = field[0].name;

    //console.log("Loot Sheet | Current actor: " + userId);
    //console.log(`Current entity permissions are: ${JSON.stringify(this.actor.ownership)}`);

    const permissions = foundry.utils.duplicate(this.actor.ownership);
    permissions[userId] = newLevel;
    //console.log(`About to change permissions are: ${JSON.stringify(permissions)}`);
    this.actor.update({ ownership: permissions });
    //console.log(`Newly changed entity permissions are: ${JSON.stringify(this.actor.ownership)}`);
    this._onSubmit(event);
  }

  /**
   * Handle batch permission change for all players
   *
   * @param {Event} event - the event that triggered the submit
   * @private
   */
  _onBatchPermissionChange(event) {
    event.preventDefault();
    const newLevel = Number($(event.currentTarget).attr("data-perm"));
    const permissions = foundry.utils.duplicate(this.actor.ownership);
    game.users.forEach((u) => {
      if (!u.isGM) {
        permissions[u.id] = newLevel;
      }
    });
    this.actor.update({ ownership: permissions });
    this._onSubmit(event);
  }

  /* -------------------------------------------- */

  /**
   * Organize and classify Items for Loot NPC sheets
   *
   * @param {object} data - The actor data
   * @private
   */
  _prepareItems(data) {
    //console.log("Loot Sheet | _prepareItems")
    super._prepareItems(data);

    if (!this.actor.visible) return;

    data.inventory.forEach((section) => {
      section.items?.forEach((i) => {
        i.img = i.img || LootSheetPf1NPC.DEFAULT_TOKEN;
        i.showPrice = this.getLootPrice(i);
        // i.showName = this.getLootName(i);

        if (!game.user.isGM && i.flags.lootsheetnpcpf1 && i.flags.lootsheetnpcpf1.secret) {
          return;
        }

        if (i.flags.lootsheetnpcpf1 && i.flags.lootsheetnpcpf1.infinite) {
          i.quantity = 1;
        }
      });
    });
  }

  /**
   * Prepare item data for display.
   *
   * @protected
   * @param {pf1.documents.item.ItemPF} item - Original document
   * @returns {object} - Data fed to the sheet
   */
  _prepareItem(item) {
    const result = super._prepareItem(item);

    if (item.isPhysical) {
      result.price = item.getValue({ recursive: false, sellValue: 1, inLowestDenomination: true }) / 100;
    }
    //
    return result;
  }

  /* -------------------------------------------- */

  /**
   * Get the font-awesome icon used to display the permission level.
   *
   * @param {number} level - The permission level
   * @returns {string} - The permission icon html
   * @private
   */
  _getPermissionIcon(level) {
    return LootSheetConstants.permissionIcons[level];
  }

  /* -------------------------------------------- */

  /**
   * Get the font-awesome icon used to display the permission level.
   *
   * @param {number} level - The permission level
   * @returns {string} - The permission
   * @private
   */
  _getPermissionDescription(level) {
    //console.log("Loot Sheet | _getPermissionDescription")
    return game.i18n.localize(LootSheetConstants.permissionDescriptions[level]);
  }

  /* -------------------------------------------- */

  /**
   * Prepares GM settings to be rendered by the loot sheet.
   *
   * @param {object} actorData - The actor data
   * @returns {object} loot - The loot
   * @async
   * @private
   */
  async _prepareGMSettings(actorData) {
    console.debug("Loot Sheet | _prepareGMSettings");

    const players = [],
      owners = new Set();
    const users = game.users.contents;

    console.debug("Loot Sheet _prepareGMSettings | actorData.ownership", actorData.ownership);
    const limitUsers = game.settings.get(LootSheetConstants.MODULENAME, "limitUsersByActor");

    for (const u of users) {
      console.debug("Loot Sheet | Checking user " + u.name, u);

      //check if the user is a player
      if (u.role === CONST.USER_ROLES.PLAYER || u.role === CONST.USER_ROLES.TRUSTED) {
        // get the name of the primary actor for a player
        const actor = game.actors.get(u.character?.id) ?? null;
        console.debug("Loot Sheet | Checking actor", actor);
        const userData = {
          name: u.name,
          userId: u._id,
          actors: {},
          defaultActor: this.actor.getFlag(LootSheetConstants.MODULENAME, `playerIds.${u._id}`),
          limited:
            (u._id !== game.userId && !game.user.isGM) ||
            (u._id in this.actor.ownership && this.actor.ownership[u._id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED),
        };
        console.log(`User check: ${u._id} vs ${game.userId}: ${u._id !== game.userId}. GM check: ${!game.user.isGM}`);

        if (limitUsers && actor) {
          userData.actors[`${actor._id}`] = actor.name;
          if (!userData.defaultActor) {
            userData.defaultActor = actor._id;
            await this.actor.setFlag(LootSheetConstants.MODULENAME, `playerIds.${u._id}`, actor._id);
          }
        } else if (!limitUsers) {
          for (const a of game.actors.contents.filter(
            (a) => u._id in a.ownership && a.ownership[u._id] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
          )) {
            if (!userData.defaultActor) {
              userData.defaultActor = a._id;
              await this.actor.setFlag(LootSheetConstants.MODULENAME, `playerIds.${u._id}`, a._id);
            }

            userData.actors[`${a._id}`] = a.name;
          }
        }

        //Check if there are default permissions to the actor
        // if (typeof actorData.ownership.default !== "undefined") {
        console.debug("Loot Sheet | default permissions", actorData.ownership.default);
        const defaultPermission = actorData.ownership.default;
        const userPermission = u._id in actorData.ownership ? actorData.ownership[u._id] : null;
        userData.lootPermission = userPermission !== null ? userPermission : defaultPermission;

        // If the user doesn't have explicit permissions, check if the default permissions grant them observer access
        if (!owners.has(u._id)) {
          if (actorData.ownership.default === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
            owners.add(u._id);
          } else if (userPermission) {
            console.debug("Loot Sheet | Found individual actor permission");
            console.debug("Loot Sheet | assigning " + userPermission + " permission to hidden field");

            // If the user has at least observer rights, add them to the list of owners
            if (userPermission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
              owners.add(u._id);
            }
          }
        }

        //Set icons and permission texts for html
        console.debug("Loot Sheet | lootPermission", userData.lootPermission);
        userData.icon = this._getPermissionIcon(userData.lootPermission);
        userData.lootPermissionDescription = this._getPermissionDescription(userData.lootPermission);
        players.push(userData);
      }
    }

    // calculate the split of coins between all owners of the sheet.
    const currencySplit = foundry.utils.duplicate(actorData.system.currency);
    const altCurrencySplit = foundry.utils.duplicate(actorData.system.altCurrency);
    for (const c in currencySplit) {
      if (owners.size) {
        currencySplit[c] =
          Math.floor(currencySplit[c] / owners.size) + " / " + Math.floor(altCurrencySplit[c] / owners.size);
      } else {
        currencySplit[c] = "0";
      }
    }

    const loot = {
      warning: actorData.ownership.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
      players,
      ownerCount: owners.size,
      currency: currencySplit,
      altCurrency: altCurrencySplit,
      limitUsers,
    };

    return loot;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   *
   * @param {string} _selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(_selector) {
    const canDrop =
      game.user.isGM ||
      (game.userId in this.actor.ownership &&
        this.actor.ownership[game.userId] >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER);

    if (this.actor.getFlag(LootSheetConstants.MODULENAME, "lootsheettype") === "Merchant") return true;
    else return canDrop;
  }

  /**
   *
   * @param {Event} event     - The drop event
   * @returns {Promise<boolean>}  - True if the drop was handled, false otherwise
   * @private
   */
  async _onDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type === "Currency") {
        await this._onDropCurrency(event, data);
        return;
      } else if (data.type !== "Item") return;
      // eslint-disable-next-line no-unused-vars
    } catch (_err) {
      return false;
    }

    const uuidData = foundry.utils.parseUuid(data.uuid);
    if (!uuidData || (uuidData.primaryType === "Actor" && uuidData.primaryId === this.actor.id)) return;
    if (!game.user.isGM && this.actor.getFlag(LootSheetConstants.MODULENAME, "dropEnabled") === false)
      return ui.notifications.warn(game.i18n.localize("ERROR.lsDropDisabled"));

    console.debug("Drop Data: ", data);
    let uuidParts = data.uuid?.split(".");
    if (!uuidParts) {
      uuidParts = [];
      if (data.actorUuid) {
        uuidParts = data.actorUuid.split(".");
      }

      if (data.containerId) {
        uuidParts.push("Container", data.containerId);
      }

      uuidParts.push("Item", data.itemId);
    }
    console.debug("UUID Data", uuidData, uuidParts); //, foundry.utils.parseUuid(data.uuid));

    console.debug(event);
    console.debug(data);
    console.debug(await Item.fromDropData(data));

    const [sourceActor, itemId, containerId] = LootSheetActions.getSourceActorAndItem(uuidParts);
    // If the actor isn't found, then the item likely comes from a compendium
    // In that case, just process it normally for GMs. For players, reject.
    if (!sourceActor) {
      if (game.user.isGM) {
        super._onDropItem(event, data);
        return true;
      } else if (uuidParts[0] === "Compendium") {
        ui.notifications.error(game.i18n.localize("ERROR.lsInvalidDrop"));
        return false;
      }
    }

    // If the item id isn't found, then something's gone wrong.
    if (!itemId) {
      return ui.notifications.error(game.i18n.localize("ERROR.InvalidItem"));
    }

    const targetGM = game.users.find((u) => {
      return u.isGM && u.active && u.viewedScene === game.user.viewedScene;
    });
    const targetActor = this.token ? canvas.tokens.get(this.token.id).actor : this.actor;

    let item = sourceActor.getEmbeddedDocument("Item", itemId);
    if (!item && containerId) {
      const container = sourceActor.getEmbeddedDocument("Item", containerId);

      if (container) {
        item = container.items.get(itemId);
      }
    }
    if (!item) {
      ui.notifications.warn(game.i18n.format("ERROR.lsInvalidMove", { actor: sourceActor.name }));
      console.log(sourceActor, targetActor, itemId);
      return null;
    }

    const options = {
      title: game.i18n.format(`ls.dropTitle`, { item: item.name }),
      acceptLabel: game.i18n.localize("ls.drop"),
      initial: item.system.quantity,
      total: item.system.quantity,
    };
    if (item.system.quantity == 1) {
      options.label = game.i18n.format(`ls.dropContent`, { item: item.name });
    }

    const callback = async (quantity, stacking) => {
      // If we're here, the item is valid and we can proceed with the drop
      if (game.user.isGM) {
        await LootSheetActions.dropOrSellItem(
          game.user,
          targetActor,
          sourceActor,
          itemId,
          containerId,
          quantity,
          stacking
        );
      } else {
        // Users don't have the rights for the transaction => ask GM to do it
        if (targetGM) {
          const packet = {
            type: "drop",
            userId: game.userId,
            itemId,
            sourceUUID: sourceActor.uuid,
            targetUUID: this.actor.uuid,
            processorId: targetGM.id,
            quantity,
            stacking,
          };
          game.socket.emit(LootSheetConstants.SOCKET, packet);
        }
      }
    };

    if (item.system.quantity > 1) {
      await QuantityDialog.wait(options, callback);
    } else {
      await callback(1, true);
    }
  }
}
