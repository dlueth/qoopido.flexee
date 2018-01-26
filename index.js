'use strict';

const Listener  = require('./class/listener.js');
const Event     = require('./class/event.js');
const validator = require('./helper/validator.js');
const weakmap   = new WeakMap();

/**
 * Initialize a weakmap for a given context
 *
 * @param {Emitter} context
 *
 * @returns {Emitter}
 *
 * @ignore
 */
function initialize(context) {
	weakmap.set(context, { timestamp: +new Date(), events: {}, expressions: [] });

	return context;
}

/**
 * Remove an event listener
 *
 * @param {Listener} listener
 * @param {Function} listener.callback
 *
 * @returns {Boolean}
 *
 * @ignore
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
 *
 * @ignore
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
 *
 * @ignore
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
 *
 * @ignore
 */
function mapListener(listener) {
	return listener.callback;
}

/**
 * Apply an event + optional details to all listener
 *
 * @param {Listener[]} listener
 * @param {Event} event
 * @param {Object[]=} details
 *
 * @ignore
 */
async function applyEvent(listener, event, details) {
	let i = 0, item;

	for(; (item = listener[i]); i++) {
		await item.callback.call(this, event, ...details);

		if(item.remaining && !(item.remaining -= 1)) {
			this.off(item.identifier, item.callback);
		}

		if(event.isCanceled) {
			break;
		}
	}
}

/**
 * Subscribe an event listener
 *
 * @param {String} name
 * @param {Function} callback
 * @param {Boolean=} prepend
 * @param {Number=} limit
 *
 * @ignore
 */
function subscribeEvent(name, callback, prepend, limit) {
	(this.events[name] = this.events[name] || []).push(new Listener(this, name, callback, prepend, limit));
}

/**
 * Unregister an event listener
 *
 * @param {String} name
 * @param {Function} callback
 *
 * @ignore
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
 *
 * @ignore
 */
function subscribeExpression(expression, callback, prepend, limit) {
	this.expressions.push(new Listener(this, expression, callback, prepend, limit));
}

/**
 * Unsubscribe an expression listener
 *
 * @param {RegExp} expression
 * @param {Function} callback
 *
 * @ignore
 */
function unsubscribeExpression(expression, callback) {
	this.expressions = this.expressions.filter(filterRemoveExpression, { identifier: expression, callback: callback });
}

/**
 * Retrieve all listeners for a certain event
 *
 * @param {String} name
 *
 * @returns {Object[]}
 *
 * @ignore
 */
function retrieveListener(name) {
	let listener;

	if(validator.isString(name)) {
		let storage  = weakmap.get(this);

		listener = storage.events[name] ? storage.events[name].slice() : [];

		if(this !== Emitter) {
			listener = listener.concat(retrieveListener.call(Emitter, name));
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
		initialize(this);
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
			applyEvent.call(this, listener, new Event(name, this), details);
		}

		return this;
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
		return Emitter.on.call(this, identifier, callback, prepend, limit);
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
		return Emitter.once.call(this, identifier, callback, prepend);
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
		return Emitter.limit.call(this, identifier, limit, callback, prepend);
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
		return Emitter.off.call(this, identifier, callback);
	}

	/**
	 * Retrieve all listeners for a certain event
	 *
	 * @param {String} name
	 *
	 * @returns {Object[]}
	 */
	listener(name) {
		return Emitter.listener.call(this, name);
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
	 *
	 * @static
	 */
	static on(identifier, callback, prepend, limit) {
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
	 *
	 * @static
	 */
	static once(identifier, callback, prepend) {
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
	 *
	 * @static
	 */
	static limit(identifier, limit, callback, prepend) {
		return this.on(identifier, callback, prepend, limit);
	}

	/**
	 * Unsubscribe an event listener
	 *
	 * @param {String|RegExp|Object[]} identifier
	 * @param {Function=} callback
	 *
	 * @returns {Emitter}
	 *
	 * @static
	 */
	static off(identifier, callback) {
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
	 * Retrieve all listeners for a certain event
	 *
	 * @param {String} name
	 *
	 * @returns {Object[]}
	 *
	 * @static
	 */
	static listener(name) {
		return retrieveListener.call(this, name).map(mapListener);
	}
}

module.exports = initialize(Emitter);
