# Flexee

[![Travis CI](https://img.shields.io/travis/dlueth/qoopido.flexee/master.svg?style=flat-square&label=travis)](https://travis-ci.org/dlueth/qoopido.flexee)
[![Coveralls](https://img.shields.io/coveralls/dlueth/qoopido.flexee/master.svg?style=flat-square&label=coveralls)](https://coveralls.io/github/dlueth/qoopido.flexee)
[![GitHub version](https://img.shields.io/github/tag/dlueth/qoopido.flexee.svg?style=flat-square&label=github)](https://github.com/dlueth/qoopido.flexee)
[![NPM version](https://img.shields.io/npm/v/flexee.svg?style=flat-square&label=npm)](https://www.npmjs.com/package/flexee)
[![NPM downloads](https://img.shields.io/npm/dt/flexee.svg?style=flat-square&label=npm%20downloads)](https://www.npmjs.org/package.flexee)
[![License](https://img.shields.io/npm/l/flexee.svg?style=flat-square)](https://github.com/dlueth/qoopido.flexee)

Flexible & dead simple event emitter for Node.js supporting RegExp-based event subscription.

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

Afterwards you can either create an instance or extend ```Flexee``` with your own ```class```.
  
Flexee offers the following methods:


### Subscribing to events
Flexee offers a total of three methods to subscribe to events: ```on```, ```once``` and ```limit```.

```
// register an event listener 
emitter.on({String|RegExp} identifier, {Function} callback, {Boolean=} prepend, {Number=} limit);

// register a once only event listener
emitter.once({String|RegExp} identifier, {Function} callback, {Boolean=} prepend);

// register an event listener that gets called a limited number of times
emitter.limit({String|RegExp} identifier, {Number} limit, {Function} callback);
```

```identifier``` can either be a specific event name as ```String``` or a pattern of event names as ```RegExp``` which gives you almost endless flexibitlity.


## Unsubscribing from events
The only method to know is the ```off``` method:

```
emitter.off({String|RegExp} identifier, {Function=} callback);
```

```identifier``` can, again, either be a specific event name as ```String``` or a pattern of event names as ```RegExp```. Just keep in mind that unsubscribing from a specific event name will never unsubscribe a RegExp-listener and vice versa.


## Retrieving listener
If you need to retrieve any existing listener for a specific event simply use
 
```
emitter.listener({String} event);
```

Calling ```listener``` will always return an array which may be empty.

## Chaining
Any method beside ```listener``` returns the current instance to offer a chainable interface.