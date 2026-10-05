import { LootSheetConstants } from "../constants.mjs";

/**
 * Dialog to set the price modifier for a merchant.
 * The price modifier is a percentage (between 0 and 100) that will be applied to the
 * price of all items on the actor.
 *
 * @param {number} price - The current price modifier (between 0 and 100)
 * @param {Actor} actor - The actor to set the price modifier on
 */
export async function priceModifierDialog(price, actor) {
  const html = await renderTemplate("modules/lootsheetnpcpf1/templates/dialog-price-modifier.hbs", {
    priceModifier: price,
  });

  await foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("ls.priceModifierTitle") },
    content: html,
    classes: ["lootsheet-dialog"],
    buttons: [
      {
        action: "one",
        icon: "fa-solid fa-check",
        label: game.i18n.localize("ls.update"),
        callback: async () =>
          await actor.setFlag(
            LootSheetConstants.MODULENAME,
            "priceModifier",
            document.getElementById("price-modifier-percent").value / 100
          ),
      },
      {
        action: "two",
        default: true,
        icon: "fa-solid fa-times",
        label: game.i18n.localize("ls.cancel"),
        callback: () => console.log("Loot Sheet | Price Modifier Cancelled"),
      },
    ],
    close: () => console.log("Loot Sheet | Price Modifier Closed"),
    rejectClose: false,
    render: (_ev, html) => {
      const pmSlider = document.querySelector(`#${html.id} #price-modifier-percent`);
      const pmDisplay = document.querySelector(`#${html.id} #price-modifier-percent-display`);
      pmDisplay.value = pmSlider.value;
      pmSlider.oninput = function () {
        pmDisplay.value = this.value;
      };
      pmDisplay.oninput = function () {
        pmSlider.value = this.value;
      };
    },
  });
}
