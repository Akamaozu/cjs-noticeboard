---
CJS-NOTICEBOARD 
===============
---
[![npm version](https://badge.fury.io/js/cjs-noticeboard.svg)](https://badge.fury.io/js/cjs-noticeboard) [![Build Status](https://travis-ci.org/Akamaozu/cjs-noticeboard.svg?branch=master)](https://travis-ci.org/Akamaozu/cjs-noticeboard) [![Coverage Status](https://coveralls.io/repos/github/Akamaozu/cjs-noticeboard/badge.svg?branch=master)](https://coveralls.io/github/Akamaozu/cjs-noticeboard?branch=master)

WHAT IS A NOTICEBOARD?
=

**A Noticeboard is just the Pub-Sub pattern with a twist: most-recently published values are cached and accessible by future subscribers.**

HOW TO USE IT
=

## Install

```
	npm install cjs-noticeboard
```

## Basic Use

### Create New Noticeboard

```js

	var Noticeboard = require('cjs-noticeboard'),
		board = new Noticeboard();
```

### Subscribe to Notice

```js
	
	var notice = 'new-user',
		watcher = 'greet-new-users';

	board.watch( notice, watcher, function( message ){

		console.log( "Hello " + message.notice.username + "!" );
	});
```

### Publish to Notice Watchers

```js

	board.notify( 'new-user', { username: 'akamaozu' });
```

### Stop Subscribing to a Notice

```js
	
	board.ignore( 'new-user', 'greet-new-users' )
```

## Advanced Use

### Unsubscribe Immediately After Responding to a Notice

```js
	
	board.once( 'new-user', 'identify-first-user-only', function( message ){

		console.log( "First User: " + message.notice.username );
	});
```

### Use Previous Notice and Subscribe to Future Notices 

```js
	
	board.watch( 'window-size', 'log-window-size', function( message ){

		console.log( "w: " + message.notice.width  " | h: " + message.notice.height );

	}, { useCache: true });
```

### Enable Noticeboard Log Feature

```js

	var Noticeboard = require('cjs-noticeboard'),
		board = new Noticeboard({ logging: true });

	// or

	board.settings.logging = true;
```

### Enable Noticeboard Internal Operation Logging

**Note:** Noticeboard must have settings `logging` set to `true`

```js

	var Noticeboard = require('cjs-noticeboard'),
		board = new Noticeboard({ logOps: true });

	// or

	board.settings.logOps = true;
```

### Handle Noticeboard Logs

```js
	
	board.watch( 'log-entry', 'process-board-logs', function( message ){

		var entry = message.notice;

		console.log.apply( console, entry );
	});
```

API
=== 
---

new Noticeboard(settings)
---

Create a new **Noticeboard** Instance. Behavior can be configured with **settings**.

- Is a Function
- Arguments
	- **settings**
		- type: Object `{}`
		- required: false
		- props:
			- **logging**
				- type: Boolean (`true` or `false`)
				- required: false
				- desc: Determines if the Noticeboard will notify subscribers of `log-entry`.
			- **logOps**
				- type: Boolean (`true` or `false`)
				- required: false
				- desc: Determines if the Noticeboard will publish notices about its internal operations to `log-entry` watchers.

Noticeboard.notify(notice, message, source)
---

Triggers the callback in every watcher of the specified **notice**. If there is a non-null **message**, the notification will be cached. The **source** is for attribution / debugging purposes.

- Is a Function
- Arguments
	- **notice**
		- type: String
		- required: true
	- **message**
		- type: Any
		- required: false
		- gotchas: 
			1. **notifications with a message will automatically be cached**.
			2. **notifications without a message will not be cached**. 
			3. **notifications with the message object `null` will not be cached**.
	- **source**
	- type: String
	- required: false

Noticeboard.watch(notice, watcher, callback, options)
---
Adds a **watcher** to the list of **callbacks** to execute when a **notice** is sent out. The execution context and parameters of the callback can be modified via **options**.

- Is a Function
- Arguments
	- **notice**
		- type: String
		- required: true
	- **watcher**
		- type: String
		- required: true
	- **callback**
		- type: Function	
		- required: true
		- arguments passed: Object `{}`
		- arguments props: 
			- **notice**
				- description: **message** passed from `Noticeboard.notify`
			-  **watcher**
				-  description: **message** passed from `Noticeboard.watch`
	- **options**
	- type: Object `{}`
	- required: false
	- props:
		- **message**
			- type: Any
			- required: false
			- description: Passed to callback on execution. accessible inside callback as arguments[0].watcher

		- **useCache**
			- type: Boolean (`true` or `false`)
			- required: false
			- description: Set to true if its okay to autofire the callback if the notification has been previously cached

		- **once**
			- type: Boolean (`true` or `false`)
			- required: false
			- description: Set to true if you want this watcher to autoignore the notice immediately after its callback. 

Noticeboard.ignore(notice, watcher)
---
Remove a **watcher** from the list of callbacks to execute when this **notice** is sent out.

- Is a Function
- Arguments
	- **notice**
		- type: String
		- required: true
	- **watcher**
	- type: String
	- required: true

Noticeboard.once(notice, watcher, callback, options)
---
A simple wrapper around `Noticeboard.watch` that calls `Noticeboard.ignore` as soon as its **callback** is executed. See `Noticeboard.watch` for details this function's parameters.

Noticeboard.log()
---
Designed to simulate the browser's `console.log`, this function will **notify** all **watchers** of `log-entry` and pass its arguments object as the **message**. 

For instance, this is equivalent to calling `console.log`, with the added benefit of not crashing if the browser doesn't have console. That and your log can be piped to other parts of your app.

	Noticeboard.watch('log-entry', 'browser-console', function(msg){
		if(!console || typeof console.log !== "function"){ return; }
	
		console.log.apply(console, msg.notice);
	}

With the above watcher, the snippet below is now a superior version of `console.log`.

	Noticeboard.log("testing", {isTest: true}, [1,2,3], function(){})


CONTACT ME
===

- **Pull requests** 
- **email**: uzo@designbymobius.ca
- **twitter**: @akamaozu 
- **carrier pigeons** 

**Hop on the Noticeboard Train!**

	You're waiting for a train
	A train that will take you far away
	You know where you hope this train will take you
	But you don't know for sure
	Yet it doesn't matter
	Because we'll be together

	-- Mal (Inception, 2010)

![](http://1.bp.blogspot.com/_hFo3XIKmS9s/TOfe1i7dFuI/AAAAAAAAABc/xPcU3Xt4-w4/s1600/inception-7.gif)
===