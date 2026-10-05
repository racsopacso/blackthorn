/**
 * Helper functions for the PF1 NPC Loot Sheet
 */
export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("lootsheetprice", function (basePrice, modifier) {
    return pf1.utils.limitPrecision(Math.round(basePrice * modifier * 100) / 100, 3);
  });

  Handlebars.registerHelper("lootsheetweight", function (baseWeight, count) {
    return pf1.utils.limitPrecision(baseWeight * count, 3);
  });

  Handlebars.registerHelper("lootsheetname", function (name, quantity, infinite) {
    if (infinite) return `(∞) ${name}`;
    return quantity > 1 ? `(${quantity}) ${name}` : name;
  });
}
