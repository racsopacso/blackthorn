export class LootSheetUtils {
  static itemsAreEqual(x, y, k) {
    "use strict";
    const ignoredKeys = [
      "_id",
      "id",
      "folder",
      "quantity",
      // "actions",
      "createdTime",
      "modifiedTime",
      "lastModifiedBy",
      "systemVersion",
      "coreVersion",
      "duplicateSource",
      "ownership",
      "sort",
      "flags",
      "total",
      "weight",
      "_memoryVariables",
      "img",
    ];
    if (!k) k = "";
    let result = undefined;

    if (x === null || x === undefined || y === null || y === undefined) {
      result = x === y;
    }
    // after this just checking type of one would be enough
    if (result === undefined && x.constructor !== y.constructor) {
      result = false;
    } else console.debug("Constructors are equal");
    // if they are functions, they should exactly refer to same one (because of closures)
    if (result === undefined && x instanceof Function) {
      result = x === y;
    } else console.debug("Functions are equal", x, y);
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (result === undefined && x instanceof RegExp) {
      result = x === y;
    } else console.debug("Regexps are equal", x, y);
    if (result === undefined && x === null && y === null) {
      result = true;
    } else console.debug("x and y are not both null", x, y);
    if (result === undefined && (x === y || x.valueOf() === y.valueOf())) {
      result = true;
    } else console.debug("x and y are not strictly equal or do not have equal valueOf", x, y);
    if (result === undefined && Array.isArray(x) && x.length !== y.length) {
      result = false;
    } else console.debug("Arrays are of equal length", x, y);

    // if they are dates, they must had equal valueOf
    if (result === undefined && x instanceof Date) {
      result = false;
    } else console.debug("x is not a Date", x);

    // if they are strictly equal, they both need to be object at least
    if (result === undefined && !(x instanceof Object)) {
      result = false;
    } else console.debug("x is an Object", x);
    if (result === undefined && !(y instanceof Object)) {
      result = false;
    } else console.debug("y is an Object", y);

    // recursive object equality check
    if (result === undefined) {
      const p = Object.keys(x);
      result =
        Object.keys(y).every(function (i) {
          return ignoredKeys.includes(i) || p.indexOf(i) !== -1;
        }) &&
        p.every(function (i) {
          if (ignoredKeys.includes(i)) return true;
          return LootSheetUtils.itemsAreEqual(x[i], y[i], i);
        });
    }

    if (!result) console.debug("Items are not equal", { x, y, k });
    return result;
  }
}
