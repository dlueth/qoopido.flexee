'use strict';

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

module.exports = Listener;