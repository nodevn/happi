var events = require('events');
var controllers = require("./controllers");
var services = require("./services");

function Happi() {
    var self = this;
    // Inherit methods from EventEmitter
    events.EventEmitter.call(this);

    // Remove memory-leak warning about max listeners
    // See:
    // http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
    this.setMaxListeners(0);

    // init default members
    this.BaseController = controllers.BaseController;
    this.BaseService = services.BaseService;
}

// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Happi, events.EventEmitter);

// export happi components
module.exports = Happi;
exports.BaseController = services.BaseController;
exports.BaseService = services.BaseService;