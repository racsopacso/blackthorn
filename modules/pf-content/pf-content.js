Hooks.once("ready", async function () {
  if (game.modules.get("pf1-statblock-converter")?.active) {
    if (game.modules.get("pf1-statblock-converter").version.startsWith("5")) return;

    Hooks.on("sbc.loadCustomCompendiums", function (packs) {
      packs.push(
        ...[
          "pf-content.pf-35-content",
          "pf-content.pf-artifacts",
          "pf-content.pf-buffs",
          "pf-content.pf-collab-content",
          "pf-content.pf-class-abilities",
          "pf-content.pf-companion-features",
          "pf-content.pf-cursed-items",
          "pf-content.pf-eidolon-evolutions",
          "pf-content.pf-elephant",
          "pf-content.pf-feats",
          "pf-content.pf-goods-services",
          "pf-content.pf-items",
          "pf-content.pf-magicitems",
          "pf-content.pf-maladies",
          "pf-content.pf-occult-rituals",
          "pf-content.pf-racial-traits",
          "pf-content.pf-special-qualities",
          "pf-content.pf-traits",
          "pf-content.pf-universal-monster-rules",
          "pf-content.pf-wondrous",
        ]
      );
    });
  }
});

Hooks.once("init", function () {
  const compendiumRenames = /** @type {const}*/ ({
    "pf-elephant": "pf-3rd-party",
    "pf-magic": "pf-magic-items",
  });

  const prefix = `Compendium.pf-content`;
  for (const [oldName, newName] of Object.entries(compendiumRenames)) {
    CONFIG.compendium.uuidRedirects[`${prefix}.${oldName}`] = `${prefix}.${newName}`;
  }
});
