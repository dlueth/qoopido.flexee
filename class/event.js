'use strict';

const global = new WeakMap();

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

		global.set(this, { isCanceled: false });
	}

	cancel() {
		global.get(this).isCanceled = true;
	}

	get isCanceled() {
		return global.get(this).isCanceled;
	}
}

module.exports = Event;