Hooks.once("ready", async function () {
    if (game.modules.get("pf1-statblock-converter")?.active) {
      Hooks.on("sbc.loadCustomCompendiums", function (packs) {
        packs.push(
          ...[
            "pf1e-archetypes.pf-arch-features",
            "pf1e-archetypes.pf-archetypes",
            "pf1e-archetypes.pf-prestige-classes",
            "pf1e-archetypes.pf-prestige-features",
          ]
        );
      });
    }
  });
  