/**
 * Initialize happi app.
 */
const Happi = require("./app");

// Instantiate and expose a Happi singleton
// Expose constructor as `.Happi` for convenience/tests:
// =========================================================
// var Happi = require('happi').Happi;
//
// Then:
// var newApp = new Happi();
// =========================================================
module.exports = new Happi();
module.exports.Happi = Happi
