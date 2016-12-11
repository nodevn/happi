var util = require('util');
var events = require('events');
var baseController = require("./controllers");
var baseService = require("./services");
var router = require("../router");

function Happi(apiDir) {
    var self = this;
    // Inherit methods from EventEmitter
    events.EventEmitter.call(this);

    // Remove memory-leak warning about max listeners
    // See:
    // http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
    this.setMaxListeners(0);

    // init default members
    this.BaseController = baseController;
    this.BaseService = baseService;
    this.apiDir = apiDir || "api";
}

// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Happi, events.EventEmitter);

Happi.prototype.route = function (apiDir) {
    apiDir = apiDir || "api";
    return router(apiDir);
}

// export happi components
module.exports = Happi;
exports.BaseController = baseController;
exports.BaseService = baseService;