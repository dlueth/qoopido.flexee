'use strict';

const validator = require('./helper/validator.js');
const global    = new WeakMap();

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
 * @param {String} event
 * @param {Object[]=} details
 */
function applyEvent(callback, event, details) {
	callback.apply(this, Array.prototype.concat(event, details));
}

/**
 * Subscribe an event listener
 *
 * @param {String} event
 * @param {Function} callback
 * @param {Boolean=} prepend
 * @param {Number=} limit
 */
function subscribeEvent(event, callback, prepend, limit) {
	(this.events[event] = this.events[event] || []).push(new Listener(this, event, callback, prepend, limit));
}

/**
 * Unregister an event listener
 *
 * @param {String} event
 * @param {Function} callback
 */
function unsubscribeEvent(event, callback) {
	if(this.events[event]) {
		if(callback) {
			this.events[event] = this.events[event].filter(filterRemoveEvent, callback);
		} else {
			this.events[event].length = 0;
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
 * @param {String} event
 *
 * @returns {Object[]}
 */
function retrieveListener(event) {
	let listener;

	if(validator.isString(event)) {
		let storage  = global.get(this);

		listener = storage.events[event] ? storage.events[event].slice() : [];

		storage.expressions.forEach((expression) => {
			if(expression.identifier.test(event)) {
				listener.push(expression);
			}
		});

		listener.sort(sortListener);
	}

	return listener || [];
}

class Listener {
	/**
	 * Listener constructor
	 *
	 * @param {Object} storage
	 * @param {String|RegExp} identifier
	 * @param {Function} callback
	 * @param {Boolean=} prepend
	 * @param {Number=} limit
	 */
	constructor(storage, identifier, callback, prepend, limit) {
		this.identifier = identifier;
		this.callback   = callback;
		this.timestamp  = !prepend ? +new Date() : (storage.timestamp = storage.timestamp - 1);
		this.remaining  = limit;
	}
}

class Emitter {
	/**
	 * Emitter constructor
	 */
	constructor() {
		global.set(this, { timestamp: +new Date(), events: {}, expressions: [] });
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
			let storage = global.get(this);

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
			let storage = global.get(this);

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
	 * @param {String} event
	 * @param {...*} details
	 *
	 * @returns {Emitter}
	 */
	emit(event, ...details) {
		retrieveListener.call(this, event).forEach((listener) => {
			applyEvent.call(this, listener.callback, event, details);

			if(listener.remaining && !(listener.remaining -= 1)) {
				this.off(listener.identifier, listener.callback);
			}
		});

		return this;
	}

	/**
	 * Retrieve all listeners for a certain event
	 *
	 * @param {String} event
	 *
	 * @returns {Object[]}
	 */
	listener(event) {
		return retrieveListener.call(this, event).map(mapListener);
	}
}

module.exports = Emitter;