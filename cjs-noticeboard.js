module.exports = function(){

  var codec;

  // Noticeboard Prototype
    codec = {
  
      /* watch */
        watch: function(notice, watcher, callback, options){
            
          // filter bad input 
            if(!notice || !watcher || !callback 
              || typeof notice !== 'string' 
              || typeof watcher !== 'string' 
              || typeof callback !== 'function'){ return false; }
          
          // normalize options
            if(!options || typeof options !== 'object'){ options = {}; }

          var _self, watcherList, watcherMessage, useCache, hasCache, once;

              _self = this;

              // if the list of watchers for this notice doesn't exist, create it
                if (!_self.watchers[notice]){ _self.watchers[notice] = createWatcherList(); }

              watcherList = _self.watchers[notice];
              watcherMessage = (typeof options.message !== "undefined" ? options.message : null);

              useCache = (options.useCache === true ? true : false);
              hasCache = (typeof _self.cache[notice] !== "undefined" ? true : false);

              once = (options.once === true);

          // prevent clobbering existing watcher
            if(watcherList[watcher]){ return false }
          
          // add watcher to the list with function of what they do in callback, with message if included
            watcherList[watcher] = {};
            watcherList[watcher]['callback'] = callback;
            watcherList[watcher]['watcherMessage'] = watcherMessage || null;

            if(once){ watcherList[watcher]['once'] = true }  
          
          // insta-notify if list is instant
            if(useCache === true && hasCache){

              var cache = _self.cache[notice];

              var notifyWatcherStruct = {

                'noticeMessage': cache, 
                'watcherMessage': watcherMessage
              };

              if(once){ notifyWatcherStruct.once = true }

              _self._notifyWatcher(watcher, notice, notifyWatcherStruct);
              _self.log("\n'" + notice.toUpperCase() + "' - " + "cache-hit\n" + '<- Source: ' + notice +  '-cache \n-> Notified: ' + watcher + "\n" );            
            }

            else { _self.log(' * ' + watcher  + ' started watching "' + notice.toUpperCase() + '"'); }

          return true;      
        },
  
      /* ignore */
        ignore: function (notice, watcher) {

          // filter
            if(!notice || !watcher
              || typeof notice !== 'string' 
              || typeof watcher !== 'string'){ return false; }
          
          // required vars
            var _self;

            _self = this;

          // if the subscription list DNE or watcher isn't on the list, exit
            if( !_self.watchers[notice] || !_self.watchers[notice][watcher] ){ return; }
          
          // ignore
            delete _self.watchers[notice][watcher];
          
          // update log
            _self.log(' * ' + watcher  + ' stopped watching "' + notice.toUpperCase() + '"');

          return true;        
        },
  
      /* notify */
        notify: function (notice, message, source) {

          // filter
            if(!notice || typeof notice !== 'string'){ return false; }

          // required vars
            var _self, watcherList, informedWatchers, hasCache, cache, isLogging;

          // store reference
            _self = this;
            source = source || "unidentified";            
            watcherList = _self.watchers[notice] ? _self.watchers[notice] : createWatcherList();
            informedWatchers = [];
            hasCache = (typeof _self.cache[notice] !== "undefined" ? true : false);
            isLogging = (notice === "log-entry");
          
          // process queue            
            for (var watcher in watcherList) {          
              
              var notifyWatcherStruct = {};
              notifyWatcherStruct['noticeMessage'] = message || null;
              notifyWatcherStruct['watcherMessage'] = _self.watchers[notice][watcher]['watcherMessage'] || null;

              if(_self.watchers[notice][watcher]['once']){ notifyWatcherStruct['once'] = true }
              
              // inform watcher in a separate thread 
              _self._notifyWatcher(watcher, notice, notifyWatcherStruct);
              
              // keep track of who has been informed
              informedWatchers.push(watcher);             
            }

          // cache notice
            if(typeof message !== "undefined"){ _self.cache[notice] = message; }
          
          // update log 
            if( !isLogging ){ _self.log("\n'" + notice.toUpperCase() + "' - " + "queue\n" + '<- Source: ' + source +  '\n-> Notified: ' + JSON.stringify(informedWatchers) + "\n" ); }

          return true;
        },

      /* watch once */
          once: function(notice, watcher, callback, options){

            var _self = this;

            // filter
              if(!options) options = options = {};

            // set once
              options.once = true;

            _self.watch( notice,  watcher, callback, options );
          },

      // log
          log: function(){

          var _self = this;

          if(_self.settings.logging === true){ _self.notify('log-entry', arguments); }
        }, 

      // _notifyWatcher
        _notifyWatcher: function(watcher, notice, message){

          var _self = this;

          // inform watcher in a separate thread 
            setTimeout( function(notice, watcher, message, _self) { 
              return function() {

                _self.watchers[notice][watcher]['callback']({'notice': message.noticeMessage, 'watcher': message.watcherMessage});

                if(message.once){ _self.ignore(notice, watcher); }
              } 
            }(notice, watcher, message, _self), 0 );                
        }
    }

  // Create watcher List
    function createWatcherList(){ return []; }
  
  // Constructor
    function Noticeboard(settings){

      // set default values
        this.settings = settings || { logging: true };
        this.watchers = {};
        this.cache = {};
    }

    Noticeboard.prototype = codec;
    Noticeboard.prototype.constructor = Noticeboard;

    return Noticeboard; 
}();