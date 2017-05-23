'use strict';

const weakmap = new WeakMap();

class Event {
	/**
	 * Event constructor
	 *
	 * @param {String} name
	 * @param {Emitter} context
	 */
	constructor(name, context) {
		Object.defineProperty(this, 'name', { value: name, enumerable: true, configurable: false, writable: false });
		Object.defineProperty(this, 'context', { value: context, enumerable: true, configurable: false, writable: false });

		weakmap.set(this, { isCanceled: false });
	}

	/**
	 * Cancel an events processing immediately
	 */
	cancel() {
		weakmap.get(this).isCanceled = true;
	}

	/**
	 * Retrieve an events cancelation state
	 *
	 * @returns {Boolean}
	 */
	get isCanceled() {
		return weakmap.get(this).isCanceled;
	}
}

module.exports = Event;