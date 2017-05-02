'use strict';

const expect       = require('chai').expect;
const sinon        = require('sinon');
const Emitter      = require('../index.js');

describe('class/emitter.js', () => {
	let sandbox;
	let spy;
	let event;
	let emitter;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		spy     = sandbox.spy();
		event   = (+new Date()).toString();
		emitter = new Emitter();
	});

	afterEach(function () {
		sandbox.restore();
	});

	describe('emit()', () => {
		it('should emit an event without additional parameters', () => {
			emitter
				.on(event, spy)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter });
		});

		it('should emit an event with additional parameters', () => {
			emitter
				.on(event, spy)
				.emit(event, 'first', 'second');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter }, 'first', 'second');
		});

		it('should correctly execute broadcast listeners', () => {
			Emitter.on(event, spy);

			emitter
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter });
		});

		it('should correctly cancel an event', () => {
			function cancel(event) {
				event.cancel();
			}

			emitter
				.on(event, spy)
				.on(event, cancel)
				.on(event, spy)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter });
		});
	});

	describe('on()', () => {
		it('should call an event listener repeatedly', () => {
			emitter
				.on(event, spy)
				.emit(event)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });
		});

		it('should call an expression listener repeatedly', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context instanceof Emitter;
			}

			emitter
				.on(regex, spy)
				.emit(event + '/none')
				.emit(event + '/success')
				.emit(event + '/failure')
				.emit(event)
				.emit('none');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);
		});

		it('should call an array of listeners repeatedly', () => {
			emitter
				.on([ event, event ], spy)
				.emit(event)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 4);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });
		});
	});

	describe('once()', () => {
		it('should call an event listener only once', () => {
			emitter
				.once(event, spy)
				.emit(event)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter });
		});

		it('should call an expression listener only once', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			emitter
				.once(regex, spy)
				.emit(event + '/none')
				.emit(event + '/success')
				.emit(event + '/failure')
				.emit('none');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event + '/success', context: emitter });
		});

		it('should call an array of listeners only once', () => {
			emitter
				.once([ event, event ], spy)
				.emit(event)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });
		});
	});

	describe('limit()', () => {
		it('should call an event listener a limited number of times', () => {
			emitter
				.limit(event, 3, spy)
				.emit('none')
				.emit(event)
				.emit(event)
				.emit(event)
				.emit(event)
				.emit('none');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 3);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });
		});

		it('should call an expression listener a limited number of times', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context instanceof Emitter;
			}

			emitter
				.limit(regex, 3, spy)
				.emit(event + '/none')
				.emit(event + '/success')
				.emit(event + '/failure')
				.emit(event + '/success')
				.emit(event + '/failure')
				.emit('none');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 3);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);
		});

		it('should call an array of event listeners a limited number of times', () => {
			emitter
				.limit([ event, event ], 3, spy)
				.emit('none')
				.emit(event)
				.emit(event)
				.emit(event)
				.emit(event)
				.emit('none');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 6);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });
		});
	});

	describe('off()', () => {
		it('should unregister an event listener', () => {
			emitter
				.on(event, spy)
				.emit(event)
				.off(event, spy)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 1);
			sinon.assert.calledWithExactly(spy, { name: event, context: emitter });

			expect(emitter.listener(event)).to.be.an('array').and.to.have.length.of(0);
		});

		it('should unregister all event listeners when callback-function is omitted', () => {
			emitter
				.on(event, spy)
				.on(event, spy)
				.emit(event)
				.off(event)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });

			expect(emitter.listener(event)).to.be.an('array').and.to.have.length.of(0);
		});

		it('should unregister an expression listener', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context instanceof Emitter;
			}

			emitter
				.on(regex, spy)
				.emit(event + '/none')
				.emit(event + '/success')
				.emit(event + '/failure')
				.off(regex, spy)
				.emit(event + '/success');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);

			expect(emitter.listener(event)).to.be.an('array').and.to.have.length.of(0);
		});

		it('should unregister all expression listeners when callback-function is omitted', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context instanceof Emitter;
			}

			emitter
				.on(regex, spy)
				.on(regex, spy)
				.emit(event + '/success')
				.off(regex)
				.emit(event + '/success');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);

			expect(emitter.listener(event)).to.be.an('array').and.to.have.length.of(0);
		});

		it('should unregister an array of event listeners', () => {
			emitter
				.on([ event, event ], spy)
				.emit(event)
				.off([ event, event ], spy)
				.emit(event);

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 2);
			sinon.assert.alwaysCalledWithExactly(spy, { name: event, context: emitter });

			expect(emitter.listener(event)).to.be.an('array').and.to.have.length.of(0);
		});

		it('should not unregister expression listeners when removing an event listener', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context instanceof Emitter;
			}

			emitter
				.on(event + '/success', spy)
				.on(regex, spy)
				.emit(event + '/success')
				.off(event + '/success')
				.emit(event + '/success');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 3);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);

			expect(emitter.listener(event + '/success')).to.be.an('array').and.to.have.length.of(1);
		});

		it('should not unregister an event listener when removing an expression listener', () => {
			let regex = new RegExp('^' + event + '/(?:success|failure)');

			function testEvent(event) {
				return regex.test(event.name) && event.context === emitter;
			}

			emitter
				.on(event + '/success', spy)
				.on(regex, spy)
				.emit(event + '/success')
				.off(regex)
				.emit(event + '/success');

			sinon.assert.called(spy);
			sinon.assert.calledOn(spy, emitter);
			sinon.assert.callCount(spy, 3);
			sinon.assert.alwaysCalledWithMatch(spy, testEvent);

			expect(emitter.listener(event + '/success')).to.be.an('array').and.to.have.length.of(1);
		});
	});

	describe('listener()', () => {
		it('should return an empty array for events without actual listeners', () => {
			let result = emitter.listener(event);

			expect(result).to.be.an('array').and.to.have.length.of(0);
		});

		it('should return an array of listeners', () => {
			let listener = function() {};
			let regex    = new RegExp('^' + event + '$');
			let result;

			emitter
				.on(event, function() {})
				.on(regex, function() {})
				.on(regex, listener)
				.on(event, listener)
				.off(event, listener);

			result = emitter.listener(event);

			expect(result).to.be.an('array').and.to.have.length.of(3);
		});

		it('should return an array of correctly ordered listeners', () => {
			let listeners = [ function one() {}, function two() {}, function three() {} ];
			let regex     = new RegExp('^' + event + '$');
			let result;

			emitter
				.on(event, listeners[0])
				.on(event, listeners[1], true)
				.on(regex, listeners[2], true);

			result = emitter.listener(event);

			expect(result).to.be.an('array').and.to.have.length.of(3).and.to.deep.equal(listeners.reverse());
		});
	});
});