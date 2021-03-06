# Flexee

[![Travis CI](https://img.shields.io/travis/dlueth/qoopido.flexee.svg?style=flat-square)](https://travis-ci.org/dlueth/qoopido.flexee)
[![Coveralls](https://img.shields.io/coveralls/dlueth/qoopido.flexee.svg?style=flat-square)](https://coveralls.io/github/dlueth/qoopido.flexee)
[![David](https://img.shields.io/david/dlueth/qoopido.flexee.svg?style=flat-square)](https://github.com/dlueth/qoopido.flexee)
[![License](https://img.shields.io/github/license/dlueth/qoopido.flexee.svg?style=flat-square)](https://github.com/dlueth/qoopido.flexee)
[![GitHub version](https://img.shields.io/github/tag/dlueth/qoopido.flexee.svg?style=flat-square&label=github)](https://github.com/dlueth/qoopido.flexee)
[![NPM version](https://img.shields.io/npm/v/flexee.svg?style=flat-square)](https://www.npmjs.com/package/flexee)
[![NPM downloads](https://img.shields.io/npm/dm/flexee.svg?style=flat-square)](https://www.npmjs.org/package/flexee)
[![NPM downloads](https://img.shields.io/npm/dt/flexee.svg?style=flat-square)](https://www.npmjs.org/package/flexee)


Flexible & dead simple event emitter for Node.js supporting RegExp-based event subscription and global broadcast listeners.

## Installation

```
$ npm install --save flexee # npm
$ yarn add flexee           # yarn
```


## Usage
The only thing left to do after installation via NPM or yarn is to require the module:
```
var Flexee = require('flexee');
```

Afterwards you can either create an instance or extend ```Flexee``` with your own ```class``` and use its methods as described below.

### Listeners
Listeners (also referred to as callbacks) must be of type ```Function``` which will always receive an instance of type ```Event``` as their first parameter. If the event was emitted with further parameters these will be passed to the listener as separate arguments.

The passed ```Event``` instance offers access to the event ```name``` as well as its ```context``` and, in addition, offers a ```cancel``` method to stop further processing of an event.

### Subscribing to events
Flexee offers a total of three methods to subscribe to events: ```on```, ```once``` and ```limit```.

```
// register an event listener 
emitter.on({String|RegExp|Object[]} identifier, {Function} callback, {Boolean=} prepend, {Number=} limit);

// register a once only event listener
emitter.once({String|RegExp|Object[]} identifier, {Function} callback, {Boolean=} prepend);

// register an event listener that gets called a limited number of times
emitter.limit({String|RegExp|Object[]} identifier, {Number} limit, {Function} callback);
```

```identifier``` can either be a specific event name as ```String```, a pattern of event names as ```RegExp``` or an ```array``` of both which gives you almost endless flexibitlity.


### Unsubscribing from events
The only method to know is the ```off``` method:

```
emitter.off({String|RegExp|Object[]} identifier, {Function=} callback);
```

```identifier``` can, again, either be a specific event name as ```String```, a pattern of event names as ```RegExp``` or an ```array``` of both. Just keep in mind that unsubscribing from a specific event name will never unsubscribe a RegExp-listener and vice versa.


### Emitting events
Any instance of ```Flexee``` has its own ```emit``` method:

```
emitter.emit({String} name, ...details);
```


### Retrieving listeners
If you need to retrieve any existing listener for a specific event simply use
 
```
emitter.listener({String} name);
```

Calling ```listener``` will always return an array which may be empty.

### Chaining
Any method beside ```listener``` returns the current instance to offer a chainable interface.


### Broadcast listeners
It is possible to not only subscribe to events emitted by a known instance of ```Flexee``` but also to subscribe to events emitted by any existing and/or future instance. This behaviour allows, e.g., to subscribe to events globally for logging purposes and the likes.

```
var Flexee = require('flexee');

// register a broadcast listener 
Flexee.on({String|RegExp|Object[]} identifier, {Function} callback, {Boolean=} prepend, {Number=} limit);

// register a once only broadcast listener
Flexee.once({String|RegExp|Object[]} identifier, {Function} callback, {Boolean=} prepend);

// register a broadcast listener that gets called a limited number of times
Flexee.limit({String|RegExp|Object[]} identifier, {Number} limit, {Function} callback);

// unregsiter a broadcast listener
Flexee.off({String|RegExp|Object[]} identifier, {Function=} callback);

// retrieve boradcast listeners for a specific event
Flexee.listener({String} name);
```