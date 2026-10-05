// export class QuantityDialog extends foundry.applications.api.DialogV2 {
//   constructor(callback, options) {
//     if (typeof options !== "object") {
//       options = {};
//     }

//     options = foundry.utils.mergeObject(
//       {
//         title: game.i18n.localize("ls.quantity"),
//         label: game.i18n.localize("ls.quantity"),
//         label2: game.i18n.localize("ls.quantityStack"),
//         quantity: 1,
//         quantityStack: true,
//         acceptLabel: "ls.accept",
//       },
//       options
//     );

//     super({
//       window: { title: options["title"] },
//       content: `
//             <form>
//                 <div class="form-group flexcol" style="justify-content: center;">
//                     <label>${options["label"]}</label>
//                     <input type=number min="1" id="quantity" name="quantity" value='${options["quantity"]}' style="text-align: center; width: 25%;">
//                 </div>
//                 <div class="form-group flexcol" style="justify-content: center;">
//                     <label>${options["label2"]}</label>
//                     <input type=checkbox min="1" id="quantityStack" name="quantityStack" ${options["quantityStack"] ? "checked" : ""} style="text-align: center; width: 25%;">
//                 </div>
//             </form>`,
//       buttons: [
//         {
//           action: "yes",
//           icon: "fa-solid fa-check",
//           label: options.acceptLabel,
//           default: true,
//           callback: () => {
//             const quantity = Number(document.getElementById("quantity").value);
//             const quantityStack = document.getElementById("quantityStack").checked;

//             if (isNaN(quantity)) {
//               console.log("Loot Sheet | Item quantity invalid");
//               return ui.notifications.error(game.i18n.localize("ERROR.lsItemInvalidQuantity"));
//             }

//             callback(quantity, quantityStack);
//           },
//         },
//         {
//           action: "no",
//           icon: "fa-solid fa-times",
//           label: game.i18n.localize("ls.cancel"),
//         },
//       ],
//       default: "yes",
//     });
//   }
// }

/**
 * Stack splitting dialog
 * Taken and adapted from the PF1 system.
 *
 * @example
 * ```js
 * const result = await pf1.applications.SplitStack.wait({ title: "My Stuff", initial: 50, total: 100 });
 * if (!result) throw new Error("Fsck!");
 * const [keep,split] = result;
 * console.log(`I keep ${keep} and you get ${split}`);
 * ```
 */
export class QuantityDialog extends foundry.applications.api.DialogV2 {
  /**
   * Wait for user interaction to finish.
   *
   * @param {object} options - Options
   * @param {string} [options.title] - Dialog title
   * @param {number} options.initial - Initial value
   * @param {number} options.total - Total value to split.
   * @param {number} [options.step] - Value stepping.
   * @param {string[]} [options.css] - Optional CSS selectors to add to the dialog.
   * @param {Function} [callback] - Optional callback to execute on confirmation. If not provided, the promise will resolve with the result.
   * @param {object} dialogOptions - Additional options to pass to DialogV2
   * @returns {Promise<number|null>} - Number tuple, to keep and to split values. Null if cancelled.
   */
  static async wait(
    { title, initial = 1, step = 1, total, css = [] } = {},
    callback = null,
    dialogOptions = {
      position: {
        width: 320,
      },
    }
  ) {
    step ||= 1;
    initial = Math.clamp(initial || 0, 1, total);
    const max = total;

    const content = await renderTemplate("modules/lootsheetnpcpf1/templates/quantity-dialog.hbs", {
      initial,
      keep: total - initial,
      max,
      quantityStack: true,
    });

    const options = {
      window: { title },
      content,
      classes: ["pf1-v2", "split-stack", ...css],
      buttons: [
        {
          icon: "fa-solid fa-people-arrows",
          label: game.i18n.localize("ls.accept"),
          action: "split",
          default: true,
          callback: (event, target, html) => {
            if (html instanceof foundry.applications.api.DialogV2) html = html.element; // v12 & v13 cross-compatibility

            const quantity = Math.clamp(html.querySelector("form input.quantity").valueAsNumber, 0, max);
            const quantityStack = html.querySelector("input#quantityStack").checked;
            if (Number.isNumeric(quantity) && callback && quantity > 0) {
              callback(quantity, quantityStack);
            }
            return null;
          },
        },
      ],
      render: (event, html) => {
        if (html instanceof foundry.applications.api.DialogV2) html = html.element; // v12 & v13 cross-compatibility

        html = html.querySelector(".dialog-content");
        const slider = html.querySelector("input.slider");
        const oldStack = html.querySelector("input.left");
        const newStack = html.querySelector("input.quantity");
        slider.addEventListener(
          "input",
          (ev) => {
            const newValue = ev.target.valueAsNumber;
            newStack.value = newValue;
            oldStack.value = total - newValue;
          },
          { passive: true }
        );
        newStack.addEventListener(
          "input",
          (ev) => {
            let newValue = ev.target.valueAsNumber;
            if (newValue > max) {
              newStack.value = max;
              newValue = max;
            } else if (newValue < 1) {
              newStack.value = 1;
              newValue = 1;
            }
            slider.value = newValue;
            oldStack.value = total - newValue;
          },
          { passive: true }
        );
        oldStack.addEventListener("input", (ev) => {
          let newValue = total - ev.target.valueAsNumber;
          if (newValue > total) {
            oldStack.value = max;
            newValue = 1;
          } else if (newValue < 0) {
            oldStack.value = 0;
            newValue = max;
          }
          newStack.value = newValue;
          slider.value = newValue;
        });
      },
      close: () => null,
      rejectClose: false,
    };

    return super.wait(foundry.utils.mergeObject(options, dialogOptions));
  }
}
