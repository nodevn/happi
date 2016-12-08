var events = require('events');

function Happi() {
  var self = this;
  // Inherit methods from EventEmitter
  events.EventEmitter.call(this);

  // Remove memory-leak warning about max listeners
  // See:
  // http://nodejs.org/docs/latest/api/events.html#events_emitter_setmaxlisteners_n
  this.setMaxListeners(0);
}

// Extend from EventEmitter to allow hooks to listen to stuff
util.inherits(Happi, events.EventEmitter);


// export happi constructor
module.exports = Happi;