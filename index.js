'use strict';

const Listener  = require('./class/listener.js');
const Event     = require('./class/event.js');
const validator = require('./helper/validator.js');
const weakmap   = new WeakMap();

/**
 * Remove an event listener
 *
 * @param {Listener} listener
 * @param {Function} listener.callback
 *
 * @returns {Boolean}
 */
function filterRemoveEvent(listener) {
	return listener.callback !== this;
}

/**
 * Remove an expression listener
 *
 * @param {Listener} listener
 * @param {RegExp} listener.identifier
 * @param {Function} listener.callback
 *
 * @returns {Boolean}
 */
function filterRemoveExpression(listener) {
	return !(listener.identifier.toString() === this.identifier.toString() && (typeof this.callback === 'undefined' || listener.callback === this.callback));
}

/**
 * Sort listener array
 *
 * @param {Object} a
 * @param {int} a.timestamp
 * @param {Object} b
 * @param {int} b.timestamp
 *
 * @returns {Number}
 */
function sortListener(a, b) {
	return a.timestamp - b.timestamp;
}

/**
 * Return a listeners callback
 *
 * @param {Listener} listener
 * @param {Function} listener.callback
 *
 * @returns {Function}
 */
function mapListener(listener) {
	return listener.callback;
}

/**
 * Apply an event + optional details to a listener
 *
 * @param {Function} callback
 * @param {Event} event
 * @param {Object[]=} details
 */
function applyEvent(callback, event, details) {
	callback.apply(this, Array.prototype.concat(event, details));
}

/**
 * Subscribe an event listener
 *
 * @param {String} name
 * @param {Function} callback
 * @param {Boolean=} prepend
 * @param {Number=} limit
 */
function subscribeEvent(name, callback, prepend, limit) {
	(this.events[name] = this.events[name] || []).push(new Listener(this, name, callback, prepend, limit));
}

/**
 * Unregister an event listener
 *
 * @param {String} name
 * @param {Function} callback
 */
function unsubscribeEvent(name, callback) {
	if(this.events[name]) {
		if(callback) {
			this.events[name] = this.events[name].filter(filterRemoveEvent, callback);
		} else {
			this.events[name].length = 0;
		}
	}
}

/**
 * Subscribe an expression listener
 *
 * @param {RegExp} expression
 * @param {Function} callback
 * @param {Boolean=} prepend
 * @param {Number=} limit
 */
function subscribeExpression(expression, callback, prepend, limit) {
	this.expressions.push(new Listener(this, expression, callback, prepend, limit));
}

/**
 * Unsubscribe an expression listener
 *
 * @param {RegExp} expression
 * @param {Function} callback
 */
function unsubscribeExpression(expression, callback) {
	this.expressions = this.expressions.filter(filterRemoveExpression, { identifier: expression, callback: callback });
}

/**
 * Retrieve all listeners for a certain event
 *
 * @param {String} name
 * @param {Boolean=} isGlobal
 *
 * @returns {Object[]}
 */
function retrieveListener(name, isGlobal) {
	let listener;

	if(validator.isString(name)) {
		let storage  = weakmap.get(this);

		listener = storage.events[name] ? storage.events[name].slice() : [];

		if(isGlobal !== true) {
			listener = listener.concat(retrieveListener.call(global, name, true));
		}

		storage.expressions.forEach((expression) => {
			if(expression.identifier.test(name)) {
				listener.push(expression);
			}
		});

		listener.sort(sortListener);
	}

	return listener || [];
}

class Emitter {
	/**
	 * Emitter constructor
	 */
	constructor() {
		weakmap.set(this, { timestamp: +new Date(), events: {}, expressions: [] });
	}

	/**
	 * Subscribe an event listener
	 *
	 * @param {String|RegExp|Object[]} identifier
	 * @param {Function} callback
	 * @param {Boolean=} prepend
	 * @param {Number=} limit
	 *
	 * @returns {Emitter}
	 */
	on(identifier, callback, prepend, limit) {
		if(validator.isIdentifier(identifier) && validator.isCallback(callback)) {
			let storage = weakmap.get(this);

			if(validator.isString(identifier)) {
				subscribeEvent.call(storage, identifier, callback, prepend, limit);
			}

			if(validator.isExpression(identifier)) {
				subscribeExpression.call(storage, identifier, callback, prepend, limit);
			}

			if(validator.isArray(identifier)) {
				identifier.forEach((identifier) => {
					this.on(identifier, callback, prepend, limit);
				});
			}
		}

		return this;
	}

	/**
	 * Subscribe a once only event listener
	 *
	 * @param {String|RegExp|Object[]} identifier
	 * @param {Function} callback
	 * @param {Boolean=} prepend
	 *
	 * @returns {Emitter}
	 */
	once(identifier, callback, prepend) {
		return this.on(identifier, callback, prepend, 1);
	}

	/**
	 * Subscribe a limited event listener
	 *
	 * @param {String|RegExp|Object[]} identifier
	 * @param {Number} limit
	 * @param {Function} callback
	 * @param {Boolean=} prepend
	 *
	 * @returns {Emitter}
	 */
	limit(identifier, limit, callback, prepend) {
		return this.on(identifier, callback, prepend, limit);
	}

	/**
	 * Unsubscribe an event listener
	 *
	 * @param {String|RegExp|Object[]} identifier
	 * @param {Function=} callback
	 *
	 * @returns {Emitter}
	 */
	off(identifier, callback) {
		if(validator.isIdentifier(identifier) && (validator.isCallback(callback) || typeof callback === 'undefined')) {
			let storage = weakmap.get(this);

			if(validator.isString(identifier)) {
				unsubscribeEvent.call(storage, identifier, callback)
			}

			if(validator.isExpression(identifier)) {
				unsubscribeExpression.call(storage, identifier, callback);
			}

			if(validator.isArray(identifier)) {
				identifier.forEach((identifier) => {
					this.off(identifier, callback);
				});
			}
		}

		return this;
	}

	/**
	 * Emit an event
	 *
	 * @param {String} name
	 * @param {...*} details
	 *
	 * @returns {Emitter}
	 */
	emit(name, ...details) {
		let listener = retrieveListener.call(this, name);

		if(listener.length) {
			let event = new Event(name, this);

			listener.some((listener) => {
				applyEvent.call(this, listener.callback, event, details)

				if(listener.remaining && !(listener.remaining -= 1)) {
					this.off(listener.identifier, listener.callback);
				}

				return event.isCanceled;
			});
		}

		return this;
	}

	/**
	 * Retrieve all listeners for a certain event
	 *
	 * @param {String} name
	 *
	 * @returns {Object[]}
	 */
	listener(name) {
		return retrieveListener.call(this, name).map(mapListener);
	}
}

const global = new Emitter();

Emitter.on       = global.on.bind(global);
Emitter.once     = global.once.bind(global);
Emitter.limit    = global.limit.bind(global);
Emitter.off      = global.off.bind(global);
Emitter.listener = global.listener.bind(global);

module.exports = Emitter;