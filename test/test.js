var assert, Noticeboard, test_board, notice, watcher;

assert = require('assert');
Noticeboard = require('../cjs-noticeboard.js');

test_board = new Noticeboard();
notice = 'behavior-test';
watcher = 'assert-behavior';

describe('Noticeboard', function(){

	it('is a function', function(){

		assert.equal(typeof Noticeboard, 'function', 'is not a function');
	});
});

describe('Instantiated Noticeboard Properties', function(){

	it('has expected properties of its own', function(){		

		assert.equal( test_board.hasOwnProperty('settings') && typeof test_board.settings === 'object', true, 'didn\'t instantiate with its own "settings" object');
		assert.equal( test_board.hasOwnProperty('watchers') && typeof test_board.watchers === 'object', true, 'didn\'t instantiate with its own "watchers" object');
		assert.equal( test_board.hasOwnProperty('cache') && typeof test_board.cache === 'object', true, 'didn\'t instantiate with its own "cache" object');
	});
});

describe('Instantiated Noticeboard Prototype Properties', function(){

	it('prototype has expected properties of its own', function(){		

		assert.equal( test_board.__proto__.hasOwnProperty('watch') && typeof test_board.watch === 'function', true, 'prototype is missing "watch" function');
		assert.equal( test_board.__proto__.hasOwnProperty('ignore') && typeof test_board.ignore === 'function', true, 'prototype is missing "ignore" function');
		assert.equal( test_board.__proto__.hasOwnProperty('notify') && typeof test_board.notify === 'function', true, 'prototype is missing "notify" function');
		assert.equal( test_board.__proto__.hasOwnProperty('once') && typeof test_board.once === 'function', true, 'prototype is missing "once" function');
		assert.equal( test_board.__proto__.hasOwnProperty('log') && typeof test_board.log === 'function', true, 'prototype is missing "log" function');
		assert.equal( test_board.__proto__.hasOwnProperty('_notifyWatcher') && typeof test_board._notifyWatcher === 'function', true, 'prototype is missing "_notifyWatcher" function');
	});
});

describe('Instantiated Noticeboard Behavior', function(){

	it('"watch" adds watcher to notice\'s list of watchers', function(){

		var callback, options, watcher_list, this_watcher, success;
			
		callback = function(){ console.log("i am a watcher's callback"); }
		options = {message: "this is the watcher's message"};
		success = test_board.watch(notice, watcher, callback, options);

		if(!success){ throw new Error("watch function was unsuccessful"); }
		
		watcher_list = test_board.watchers[notice];
		this_watcher = watcher_list[watcher];

		assert.equal( typeof watcher_list !== 'undefined', true, 'list of watchers was not correctly created');
		assert.equal( typeof this_watcher !== 'undefined', true, 'watcher was not added to list of watchers');
		assert.equal( this_watcher.callback === callback && this_watcher.watcherMessage === options.message, true, 'watcher was not correctly added to notice\'s list of watchers');
	});

	it('"notify" triggers a watcher\'s callback', function(done){

		var message, success, callback_triggered;
		
		message = "this is the notice's message";
		callback_triggered = false;

		test_board.watch(notice, watcher, function(msg){ 

			var mocha_done = msg.watcher;

			callback_triggered = true; 
			mocha_done();

			assert.equal( callback_triggered === true, true, 'watcher\'s callback was not triggered' ); 
		}, {message: done});

		success = test_board.notify(notice, message);

		if(!success){ throw new Error("notify function was unsuccessful"); }
	});

	it('"watch" triggers its callback if cache exists and useCache is true', function(done){

		var cache_used = false;

		test_board.watch(notice, watcher, function(msg){

			var mocha_done = msg.watcher;

			cache_used = true;
			mocha_done();

			assert.equal(cache_used === true, true, 'watcher did not use cache to trigger callback');		
		}, {message: done, useCache: true});
	});

	it('"ignore" removes a watcher from a notice\'s watcher list', function(){

		var this_watcher, watcher_exists;

		this_watcher = test_board.watchers[notice][watcher];

		watcher_exists = (typeof this_watcher !== 'undefined');

		if(!watcher_exists){ throw new Error('watcher wasn\'t set up before assertion'); }

		test_board.ignore(notice, watcher);

		assert.equal(typeof test_board.watchers[notice][watcher] === "undefined", true, 'watcher hasn\'t been removed from watcher list');
	});

	it('"once" ignores a notice after its callback has been fired', function(done){

		// chain of events 
		// 1. notify once-completed in once's callback
		// 2. do assertions when notified once-completed
		
		test_board.once(notice, watcher, function(msg){

			var mocha_done = msg.watcher;

			test_board.notify('once-completed', mocha_done);

		}, {message: done});

		test_board.watch('once-completed', 'do-assertions', function(msg){

			var relayed_mocha_done = msg.notice;

			relayed_mocha_done();

			assert.equal(typeof test_board.watchers[notice][watcher] === "undefined", true, 'watcher hasn\'t been removed from watcher list');
		});

		test_board.notify(notice);
	});

	it('"once" triggers callback if cache exists and useCache is true', function(done){

		var callback_autotriggered = false;

		test_board.notify(notice, done);

		test_board.once(notice, watcher, function(msg){

			var mocha_done = msg.notice;

			callback_autotriggered = true;
			mocha_done();

			assert.equal(callback_autotriggered === true, true, 'once\'s callback was not triggered');

		},{useCache: true});
	});

	it('"log" sends its message to watchers of log-entry', function(done){

		// once should trigger the callback due to autolog
		test_board.once('log-entry', watcher, function(msg){

			var log_arguments, mocha_done;

			mocha_done = msg.watcher;
			log_arguments = msg.notice;

			mocha_done();

			assert.equal(log_arguments.length > 0, true, 'message received is not the same as log entry');

		},{message: done});
	});

	it('"_notifyWatcher" overrides default message and fires watcher\'s callback', function(done){

		var watcher_msg, notice_msg, mocha_done;

		watcher_msg = "untouchable";
		notice_msg = "_notifyWatcher";
		mocha_done = done;

		test_board.watch(notice, watcher, function(msg){

			var received_msg, was_touched;

			received_msg = msg.watcher;
			was_touched = ((watcher_msg !== received_msg) && (msg.notice === notice_msg));

			mocha_done();

			assert.equal(was_touched === true, true, 'message was not touched');

		}, {message: watcher_msg});

		test_board._notifyWatcher(watcher, test_board.watchers[notice], {watcherMessage: "touched", noticeMessage: notice_msg});
	});
});