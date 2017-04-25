'use strict';

/**
 * Check if identifier is of valid tye
 *
 * @param {*} identifier
 *
 * @returns {Boolean}
 */
function isIdentifier(identifier) {
	return (isString(identifier) || isExpression(identifier) || isArray(identifier));
}

/**
 * Check if value is a valid callback
 *
 * @param {*} value
 *
 * @returns {Boolean}
 */
function isCallback(value) {
	return (typeof value === 'function');
}

/**
 * Check if value is of type string
 *
 * @param {*} value
 *
 * @returns {Boolean}
 */
function isString(value) {
	return (typeof value === 'string');
}

/**
 * Check if value is of type array
 *
 * @param {*} value
 *
 * @returns {Boolean}
 */
function isArray(value) {
	return Array.isArray(value);
}

/**
 * Check if value is a RegExp
 *
 * @param {*} value
 *
 * @returns {Boolean}
 */
function isExpression(value) {
	return (value instanceof RegExp);
}

module.exports = {
	isIdentifier: isIdentifier,
	isCallback:   isCallback,
	isString:     isString,
	isArray:      isArray,
	isExpression: isExpression
};