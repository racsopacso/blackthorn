import { LootSheetActions } from "./actions.mjs";
import { LootSheetConstants } from "./constants.mjs";

/**
 *
 * @param {object} data   The data received from the socket
 * @returns {void}
 */
export async function runSocketListeners(data) {
  console.debug("Loot Sheet | Socket Message: ", data);
  if (game.user.isGM && data.processorId === game.user.id) {
    const user = game.users.get(data.userId);
    const targetActor = fromUuidSync(data.targetUUID);
    if (data.type === "defaultActorChange" && targetActor) {
      await targetActor.setFlag(LootSheetConstants.MODULENAME, `playerIds.${data.userId}`, data.actorId);
    } else {
      const sourceActor = fromUuidSync(data.sourceUUID);

      if (data.type === "buy") {
        if (sourceActor && targetActor) {
          await LootSheetActions.transaction(user, targetActor, sourceActor, data.itemId, data.quantity, data.stacking);
        } else if (!targetActor) {
          LootSheetActions.errorMessageToActor(sourceActor, game.i18n.localize("ERROR.lsNoActiveGM"));
          ui.notifications.error(game.i18n.localize("ERROR.lsPurchaseAttempt"));
        }
      } else if (data.type === "loot") {
        if (sourceActor && targetActor) {
          await LootSheetActions.lootItem(user, targetActor, sourceActor, data.itemId, data.quantity, data.stacking);
        } else if (!targetActor) {
          LootSheetActions.errorMessageToActor(sourceActor, game.i18n.localize("ERROR.lsNoActiveGM"));
          ui.notifications.error(game.i18n.localize("ERROR.lsLootAttempt"));
        }
      } else if (data.type === "drop") {
        if (sourceActor && targetActor) {
          await LootSheetActions.dropOrSellItem(
            user,
            targetActor,
            sourceActor,
            data.itemId,
            null,
            data.quantity,
            data.stacking
          );
        }
      } else if (data.type === "give") {
        await LootSheetActions.giveItem(user, sourceActor, targetActor, data.itemId, data.quantity, data.stacking);
      }
    }
  }
  if (data.type === "error" && data.targetId === game.user.actorId) {
    console.log("Loot Sheet | Transaction Error: ", data.message);
    return ui.notifications.error(data.message);
  }
}
