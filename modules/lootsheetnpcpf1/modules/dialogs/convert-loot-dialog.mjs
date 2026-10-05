import { LootSheetActions } from "../actions.mjs";
import { LootSheetConstants } from "../constants.mjs";

/**
 * Dialog to confirm loot conversion and handle the conversion process.
 * If confirmed, it will initiate the selling of loot (@see LootSheetActions.spreadFunds)
 * and delete all items from the actor.
 *
 * @param {Actor} actor - The actor to convert loot for
 */
export async function convertLootDialog(actor) {
  await foundry.applications.api.DialogV2.confirm({
    window: { title: game.i18n.localize("ls.convertLootTitle") },
    content: game.i18n.format("ls.convertLootMessage", {
      saleValue: actor.getFlag(LootSheetConstants.MODULENAME, "saleValue") || 50,
    }),
    classes: ["lootsheet-dialog"],
    yes: {
      callback: async () => {
        const saleValue = Math.max(0, (await actor.getFlag(LootSheetConstants.MODULENAME, "saleValue")) || 50);
        let totalGP = 0;
        actor.items.contents
          .filter((i) => i.isPhysical)
          ?.forEach((i) => {
            totalGP += getValue(i, saleValue / 100);
          });
        const funds = LootSheetActions.spreadFunds(totalGP, foundry.utils.duplicate(actor.system.currency));
        const deleteList = [];
        actor.items.forEach((item) => {
          deleteList.push(item.id);
        });

        await actor.update({ "system.currency": funds });
        await actor.deleteEmbeddedDocuments("Item", deleteList);
      },
      default: true,
    },
    no: { default: false },
  });
}

/**
 * Calculate the total value of an item and its contents.
 *
 * @param {ItemPF} item - The item to calculate the value for
 * @param {number} saleValue - The sale value percentage (as a decimal) to apply to the item's base value
 * @returns {number} total value of the item and its contents
 */
function getValue(item, saleValue) {
  let total = LootSheetActions.getItemSaleValue(item, saleValue);
  if (isNaN(total)) total = 0;

  if (item.system.quantity && item.system.items && Object.keys(item.system.items).length) {
    Object.values(item.system.items).forEach((i) => (total += getValue(i, saleValue)));
  }

  return total;
}
