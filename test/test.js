var assert, Noticeboard, test_board;

assert = require('assert');
Noticeboard = require('../cjs-noticeboard.js');

describe('Noticeboard Test Suite', function(){
  
  describe('About Noticeboard', function(){

    it('is a function', function(){

      assert.equal(typeof Noticeboard, 'function', 'is not a function');
    });

    describe('Instantiated Noticeboard Properties', function(){

      before(function(){

        test_board = new Noticeboard();
      });

      it('has its own "settings" object', function(){   

        assert.equal( test_board.hasOwnProperty('settings') && typeof test_board.settings === 'object', true, 'didn\'t instantiate with its own "settings" object');
      });

      it('has its own "watchers" object', function(){   
        assert.equal( test_board.hasOwnProperty('watchers') && typeof test_board.watchers === 'object', true, 'didn\'t instantiate with its own "watchers" object');
      });
      
      it('has its own "cache" object', function(){    
        assert.equal( test_board.hasOwnProperty('cache') && typeof test_board.cache === 'object', true, 'didn\'t instantiate with its own "cache" object');
      });

      it('has an inherited "watch" function', function(){   
        assert.equal( test_board.__proto__.hasOwnProperty('watch') && typeof test_board.watch === 'function', true, 'prototype is missing "watch" function');
      });

      it('has an inherited "ignore" function', function(){    
        assert.equal( test_board.__proto__.hasOwnProperty('ignore') && typeof test_board.ignore === 'function', true, 'prototype is missing "ignore" function');
      });

      it('has an inherited "notify" function', function(){    
        assert.equal( test_board.__proto__.hasOwnProperty('notify') && typeof test_board.notify === 'function', true, 'prototype is missing "notify" function');
      });

      it('has an inherited "once" function', function(){    
        assert.equal( test_board.__proto__.hasOwnProperty('once') && typeof test_board.once === 'function', true, 'prototype is missing "once" function');
      });

      it('has an inherited "log" function', function(){   
        assert.equal( test_board.__proto__.hasOwnProperty('log') && typeof test_board.log === 'function', true, 'prototype is missing "log" function');
      });

      it('has an inherited "_notifyWatcher" function', function(){    
        assert.equal( test_board.__proto__.hasOwnProperty('_notifyWatcher') && typeof test_board._notifyWatcher === 'function', true, 'prototype is missing "_notifyWatcher" function');
      });
    });
  });

  describe('Noticeboard Functions Behavior', function(){

    beforeEach(function(){

      // drop all watchers
        for(var watcher in test_board.watchers){

          if( !test_board.watchers.hasOwnProperty(watcher) ){ continue; }

          delete test_board.watchers[watcher];
      }
    });

    it('"watch" adds watcher to notice\'s list of watchers', function(){

      var notice, watcher, callback, options, 
          watcher_list, this_watcher, 
          success;
      
          notice = 'watch-adds-correctly';
          watcher = 'test-suite';
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

    it('"watch" will not overwrite an existing watcher', function(){

      var notice, watcher, callback, options,
          overwrote_watcher;
      
          notice = 'watch-does-not-overwrite';
          watcher = 'test-suite';
          callback = function(){ console.log("i am a watcher's callback"); }
          options = {message: "this is the watcher's message"};
      
      test_board.watch(notice, watcher, callback, options);
      
      try{

        test_board.watch(notice, watcher, callback, options);
        overwrote_watcher = true;      
      }

      catch(e){

        overwrote_watcher = false;
      }

      assert.equal( overwrote_watcher, false, 'previous watcher was overwritten');
    });

    it('"watch" will return false if notice id is not a string', function(){

      var result;

      result = test_board.watch(1, 'watcher-id', function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though notice id is a number');

      result = test_board.watch([], 'watcher-id', function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though notice id is an array');

      result = test_board.watch({}, 'watcher-id', function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though notice id is an object');

      result = test_board.watch(null, 'watcher-id', function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though notice id is null');
    });

    it('"watch" will return false if watcher id is not a string', function(){

      var result;

      result = test_board.watch('notice-id', 1, function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though watcher id is a number');

      result = test_board.watch('notice-id', [], function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though watcher id is an array');

      result = test_board.watch('notice-id', {}, function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though watcher id is an object');

      result = test_board.watch('notice-id', null, function(){});

      assert.equal( result, false, 'Watcher sucessfully started watching though watcher id is null');
    });

    it('"watch" will return false if callback is not a function', function(){

      var result;

      result = test_board.watch('notice-id', 'watcher-id', 1);

      assert.equal( result, false, 'Watcher sucessfully started watching though callback is a number');

      result = test_board.watch('notice-id', 'watcher-id', []);

      assert.equal( result, false, 'Watcher sucessfully started watching though callback is an array');

      result = test_board.watch('notice-id', 'watcher-id', {});

      assert.equal( result, false, 'Watcher sucessfully started watching though callback is an object');

      result = test_board.watch('notice-id', 'watcher-id', null);

      assert.equal( result, false, 'Watcher sucessfully started watching though callback is null');
    });

    it('"notify" triggers a watcher\'s callback', function(done){

      var notice, watcher, message, 
          success, callback_triggered;
          
          notice = 'notify-triggers-watcher-callback';
          watcher = "test-suite";
          message = "this is the notice's message";
          callback_triggered = false;

      test_board.watch(notice, watcher, function(){

        callback_triggered = true; 
        done();

        assert.equal( callback_triggered === true, true, 'watcher\'s callback was not triggered' ); 
      });

      success = test_board.notify(notice, message);

      if(!success){ throw new Error("notify function was unsuccessful"); }
    });

    it('"notify" message is automatically cached', function(done){

      var notice, watcher;

          notice = 'notify-message-caches';
          watcher = 'test-suite';
          message = 'cached notice message';

      test_board.watch(notice, watcher, function(){

        done();

        assert.equal(typeof test_board.cache[notice] !== 'undefined', true, 'notify\'s message was not cached');   
        assert.equal(test_board.cache[notice] === message, true, 'cached message does not match the original message');   
      });

      test_board.notify(notice, message);
    });

    it('"notify" will return false if notice id is not a string', function(){

      var result;

      result = test_board.notify(1, 'watcher-id');

      assert.equal( result, false, 'Notify sucessful even though notice id is a number');

      result = test_board.notify([], 'watcher-id');

      assert.equal( result, false, 'Notify sucessful even though notice id is an array');

      result = test_board.notify({}, 'watcher-id');

      assert.equal( result, false, 'Notify sucessful even though notice id is an object');

      result = test_board.notify(null, 'watcher-id');

      assert.equal( result, false, 'Notify sucessful even though notice id is null');
    });

    it('"watch" triggers callback if useCache is true and cache exists', function(done){

      var notice, watcher, options, 
          cache_used;

          notice = 'watch-option-useCache-works';
          watcher = 'test-suite';
          options = {useCache: true};
          message = 'cached notice message';

          cache_used = false;


      test_board.notify(notice, message);

      test_board.watch(notice, 'flag-toggler', function(){

        cache_used = true;
      }, options);

      test_board.watch(notice, watcher, function(){

        done();

        assert.equal(cache_used === true, true, 'watcher did not use cache to trigger callback');   
      }, options);
    });

    it('"watch" ignores a notice after its callback if once is true ', function(done){

      var notice, watcher, message, options;

          notice = 'watch-once-autoignores';
          watcher = 'test-suite';
          message = 'cached message';
          options = {once: true};

      test_board.watch(notice, watcher, function(){

        test_board.notify('once-completed');
      }, options);

      test_board.watch('once-completed', watcher, function(msg){

        done();

        assert.equal(typeof test_board.watchers[notice][watcher] === "undefined", true, 'watcher hasn\'t been removed from watcher list');
      });

      test_board.notify(notice, message);
    });

    it('"ignore" removes a watcher from a notice\'s watcher list', function(){

      var notice, watcher,
          watcher_list, watcher_exists;

          notice = 'ignore-removes-watcher';
          watcher = 'test-suite';

      test_board.watch(notice, watcher, function(){}); // prior test already ensures watch behavior is correct      
      test_board.ignore(notice, watcher);

      watcher_list = test_board.watchers[notice];
      assert.equal(typeof watcher_list[watcher] === "undefined", true, 'watcher hasn\'t been removed from watcher list');
    });

    it('"ignore" returns false if watcher does not exist', function(){

      var notice, watcher,
          watcher_removed;

          notice = 'non-existent-notice';
          watcher = 'test-suite';

      watcher_removed = test_board.ignore(notice, watcher);

      assert.equal(watcher_removed, false, 'returned true even though watcher did not exist prior to execution');
    });

    it('"ignore" will return false if notice id is not a string', function(){

      var result;

      result = test_board.ignore(1, 'watcher-id');

      assert.equal( result, false, 'Ignore sucessful even though notice id is a number');

      result = test_board.ignore([], 'watcher-id');

      assert.equal( result, false, 'Ignore sucessful even though notice id is an array');

      result = test_board.ignore({}, 'watcher-id');

      assert.equal( result, false, 'Ignore sucessful even though notice id is an object');

      result = test_board.ignore(null, 'watcher-id');

      assert.equal( result, false, 'Ignore sucessful even though notice id is null');
    });

    it('"ignore" will return false if watcher id is not a string', function(){

      var result;

      result = test_board.ignore('notice-id', 1);

      assert.equal( result, false, 'Ignore sucessful even though watcher id is a number');

      result = test_board.ignore('notice-id', []);

      assert.equal( result, false, 'Ignore sucessful even though watcher id is an array');

      result = test_board.ignore('notice-id', {});

      assert.equal( result, false, 'Ignore sucessful even though watcher id is an object');

      result = test_board.ignore('notice-id', null);

      assert.equal( result, false, 'Ignore sucessful even though watcher id is null');
    });

    it('"once" ignores a notice after its callback has been fired', function(done){

      var notice, watcher;

          notice = 'once-autoignores-after-callback';
          watcher = 'test-suite';
      
      test_board.once(notice, watcher, function(){

        if(!test_board.watchers[notice][watcher]){ throw new Error('watcher ignored notice BEFORE callback fired'); }
        test_board.notify('once-completed');
      });

      test_board.watch('once-completed', watcher, function(){

        done();

        assert.equal(typeof test_board.watchers[notice][watcher] === "undefined", true, 'watcher hasn\'t been removed from watcher list');
      });

      test_board.notify(notice);
    });

    it('"once" triggers callback if useCache is true and cache exists', function(done){

      var notice, watcher, options,
          callback_autotriggered;

          notice = 'once-uses-cache';
          watcher = 'test-suite';
          message = 'cached message';
          options = {

            useCache: true
          };

          callback_autotriggered = false;

      test_board.watch('test-setup-complete', watcher, function(){

        done();
        assert.equal(callback_autotriggered === true, true, 'once\'s callback was not triggered');        
      
      });

      test_board.notify(notice, message);

      test_board.once(notice, 'flag-toggler', function(){

        callback_autotriggered = true;
        test_board.notify('test-setup-complete');

      }, options);
    });

    it('"log" sends its message to watchers of log-entry', function(done){

      // once should trigger the callback due to autolog
      test_board.once('log-entry', 'test-suite', function(msg){

        var log_arguments = msg.notice;

        done();

        assert.equal(log_arguments.length > 0, true, 'message received is not the same as log entry');
      });
    });
  });

  describe('Noticeboard Settings Behavior', function(){

    beforeEach(function(){

      test_board = new Noticeboard({ logging: true, logOps: true });

      // // drop all watchers
      //   for(var watcher in test_board.watchers){

      //     if( !test_board.watchers.hasOwnProperty(watcher) ){ continue; }

      //     delete test_board.watchers[watcher];
      //   }
    });

    it('"settings.logOps" determines if noticeboard operations send "log-entry" notices', function(done){

      test_board.settings.logOps = false;

      var timeout_fired = false,
          logged_operation = false;

      // once should trigger the callback due to autolog
        test_board.once('log-entry', 'test-suite', function(msg){

          logged_operation = true;

          assert.equal(timeout_fired, true, 'noticeboard operation logged before logOps was set to true');
        });

      // timeout if log operation doesn't fire
        setTimeout( function(){

          assert.equal(logged_operation, false, 'noticeboard operation was logged when logOps was set to false');
          
          timeout_fired = true;

          test_board.settings.logOps = true;

          test_board.once('log-entry', 'end-test', function(){ done() });

        }, 888);
    });

    it('"settings.logging" determines if noticeboard.log sends "log-entry" notice', function(done){

      test_board.settings.logging = false;
      test_board.settings.logOps = false;

      var timeout_fired = false,
          logged = false;

      test_board.once('log-entry', 'test-suite', function(msg){

        logged = true;

        assert.equal(timeout_fired, true, '"log" sent notice while "settings.logging" was false');
        
        done();
      });

      test_board.log('start test');

      // timeout if log operation doesn't fire
        setTimeout( function(){

          assert.equal(logged, false, '"log" sent notice while "settings.logging" was false');
          
          timeout_fired = true;

          test_board.settings.logging = true;

          test_board.log('end test');

        }, 888);
    });
  });
});