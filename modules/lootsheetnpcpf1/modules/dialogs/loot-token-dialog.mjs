import { LootSheetUtils } from "../utils.mjs";

/**
 * Displays a confirmation dialog to collect loot from tokens.
 * If confirmed, the loot from the tokens will be transferred to the specified actor,
 * and optionally deleted from the tokens.
 *
 * @param {Actor} actor - The actor to collect the loot on
 * @param {Token[]} targets - The tokens to collect loot from
 * @param {boolean} deleteLoot - Whether to delete the loot after collecting
 */
export async function lootTokensDialog(actor, targets, deleteLoot) {
  await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("ls.collectLootTitle") },
    content: game.i18n.localize("ls.collectLootMessage"),
    classes: ["lootsheet-dialog"],
    yes: {
      callback: async () => {
        const lootItems = [];
        const itemUpdates = [];
        const actorItems = actor.items.filter((i) => i.isPhysical).map((i) => i.toObject());
        const currency = { cp: 0, sp: 0, gp: 0, pp: 0 };
        const altCurrency = { cp: 0, sp: 0, gp: 0, pp: 0 };
        for (const denomination of Object.keys(currency)) {
          currency[denomination] = actor.system.currency[denomination];
          altCurrency[denomination] = actor.system.altCurrency[denomination];
        }

        for (const target of targets) {
          const updates = {};
          const deleteItems = [];
          // Gather our currencies
          for (const denomination of Object.keys(currency)) {
            currency[denomination] += target.system.currency[denomination];
            altCurrency[denomination] += target.system.altCurrency[denomination];
            updates[`system.currency.${denomination}`] = 0;
            updates[`system.altCurrency.${denomination}`] = 0;
          }

          // Gather all the items
          for (const item of target.items.filter((i) => i.isPhysical)) {
            const itemData = item.toObject();

            let existingItem = actorItems.find((i) => {
              console.groupCollapsed(`Checking equality for ${i.name} (${i.uuid})`);
              const result = LootSheetUtils.itemsAreEqual(i, itemData);
              console.groupEnd();
              return result;
            });
            if (existingItem) {
              itemUpdates.push({
                _id: existingItem.id ?? existingItem._id,
                "system.quantity": (existingItem.system.quantity += itemData.system.quantity),
              });
            } else {
              existingItem = lootItems.find((i) => {
                console.groupCollapsed(`Checking equality for ${i.name} (${i.uuid})`);
                const result = LootSheetUtils.itemsAreEqual(i, itemData);
                console.groupEnd();
                return result;
              });
              if (existingItem) {
                existingItem.system.quantity += itemData.system.quantity;
              }
            }

            if (!existingItem) lootItems.push(itemData);
            deleteItems.push(item.id);
          }

          await target.update(updates);
          if (deleteLoot) await target.deleteEmbeddedDocuments("Item", deleteItems);
        }

        await actor.updateEmbeddedDocuments("Item", itemUpdates);
        await actor.update({ "system.currency": currency, "system.altCurrency": altCurrency });
        await actor.createEmbeddedDocuments("Item", lootItems);
      },
      default: true,
    },
    no: { default: false },
  });
}
