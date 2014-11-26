---
CJS-NOTICEBOARD 
===============
---

WHAT IS A NOTICEBOARD?
- 

	The Notice Board pattern: returns the most recent value associated with a key,
	or blocks waiting for a new value if the current value has already been seen.
	
	History is not stored; only the most recent value is available.
	
	The physical analogy is a notice board like you might see at a train station:
	when you arrive at the station you can glance at the board to check the current
	departure time for your train, or you can stand around watching the board
	waiting for the inevitable message that your train has been delayed.


Wish I could take credit for such a brilliant analogy, but [all attribution goes to David Wolever](https://gist.github.com/wolever/3dc2d3af7227b6f8f79f).

---
A Noticeboard is yet another variant of the Publisher Subscriber model ... with a twist. **The most-recently data will hang around for future subscribers.**
---

Don't let the **simplicity** and **lack-of-magic** fool you though. You can build a lot of **powerful** things very quickly with it.


1. ESCAPE CALLBACK HELL
===
---

Reduce your app's fragility by decoupling pieces and synchronizing complex behavior through a simple event manager.
---
	
	var app, Noticeboard;
		Noticeboard = require('cjs-noticeboard');
		app = new Noticeboard();
		
	
	// get serverside assets
		window.addEventListener('DOMContentLoaded', function(){
			
			var ajax = new XMLHttpRequest();
			
			ajax.onreadystatechange = function(){

                // filter uncompleted responses
                    if (ajax.readyState !=4){ return; }

                // success
                    if ( ajax.status > 199 && ajax.status < 400 ){ 
						
						app.notify('serverside-assets', ajax.responseText, 'assets-ajax');
					}

                // fail
                    else{ 
						
						app.notify('assets-ajax-failed', ajax, 'assets-ajax');
					}                      
            };

			ajax.send();
		});
	
	// render ui components
		app.watch('serverside-assets', 'react-render', function(msg){
		
			var React, assets;

				React = require('React');
				assets = msg.notice;
		  
			// do something with React

			app.notify('ui-components-rendered', ReactComponents.getDOMNode(), 'react-render');
	
		}{useCache: true});
	
	// failed assets request handler
		app.watch('assets-ajax-failed', 'retry-assets-ajax', function(msg){
			
			var failed_ajax = msg.notice;

			// do retry here	
		});

Any part of your app can watch `serverside-assets` and use it as needed. Even if it missed the timing of the original request, `useCache: true` will fetch the assets from cache.

2. EASILY EXTEND YOUR APP
===
---
THE EASE OF ADDING NEW FEATURES IS TOO DAMN HIGH!
---

	// animate rendered ui components
		app.watch('ui-components-rendered', 'masonry-js', function(msg){
		
			var Masonry, components;
				Masonry = require('masonry-js');
				components = msg.notice;
		
			// animate ui components with Masonry
		});
	
Masonry has no idea you're using React to manage your view. *And it shouldn't*. It receives the components rendered and works with it seamlessly. 

Let's extend it just a little bit more.

	// log failed assets download
		app.watch('assets-ajax-failed', 'console-log', function(msg){
			
			var failed_ajax = msg.notice;		
			console.log('failed ajax: ', failed_ajax);
		});

		app.watch('assets-ajax-failed', 'google-analytics', function(){
					
			ga('send', 'event', 'failed-ajax');
		});

Failed asset requests are now logged to console as well as sent to your Google Analytics account. **Pretty straightforward, sensible extensions.** 

3. REAL SOLUTIONS
===
---

*I'll be updating this section with links to off-the-shelf tools built with this tool that makes working in the browser really easy. That way you don't have to implement the Noticeboard yourself ... just grab a real solution and drop it in your project.*

4. API
=== 
---

You don't like my Real Solutions??! **T_T**

That's cool. Here's the Noticeboard API. Roll your own. See if I care.

new Noticeboard(settings)
---

Create a new **Noticeboard** Instance. Behavior can be configured with **settings**.

- **settings**
	- type: Object `{}`
	- required: false
	- props:
		- **logging**
			- type: Boolean (`true` or `false`)
			- required: false
			- desc: Determines if the Noticeboard will notify subscribers of `log-entry`.

Noticeboard.notify(notice, message, source)
---

Triggers the callback in every watcher of the specified **notice**. If there is a non-null **message**, the notification will be cached. The **source** is for attribution / debugging purposes.

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

Noticeboard.ignore(notice, watcher)
---
Remove a **watcher** from the list of callbacks to execute when this **notice** is sent out.

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

5. SHARE YOUR REAL SOLUTIONS
===
---

That thing I said about me not caring? I lied. I'm a carebear <3 

Share all the solutions! Let's make building for the browser so much easier and less opinionated than it currently is. **Pull requests**, **emails** (uzo@designbymobius.ca), **tweets** (@akamaozu) and even **carrier pigeons** (good luck with though) accepted. 

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