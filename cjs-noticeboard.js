// PROJECT BLACKBOX


	module.exports = function(){
		
		// PUBSUB INTERNALS
		// sources announce when an event of note has occured
		// watchers react when they get the announcement of the change

		// Reqired Vars
			var codec;

		// Prototype
			codec = {
		
				/* watch */
					watch: function(notice, watcher, callback, options){
							
						// filter bad input 
							if(!notice || !watcher || !callback 
								|| typeof notice !== 'string' 
								|| typeof watcher !== 'string' 
								|| typeof callback !== 'function'){ return false; }
						
							var _self, watcherList, watcherParams, useCache, hasCache, cache;

							_self = this;

						// if the list of watchers for this notice doesn't exist, create it
							if (!_self.watchers[notice]){ _self.watchers[notice] = createWatcherList(); }

							if(!options || typeof options !== 'object'){ options = {}; }

						// get list of watchers to this notice
							watcherList = _self.watchers[notice];
							watcherParams = (typeof options.message !== "undefined" ? options.message : null);
							useCache = (options.useCache === true ? true : false);
							hasCache = ( typeof _self.cache[notice] !== "undefined" ? true : false );
						
						// add watcher to the list with function of what they do in callback, with params if needed
							watcherList[watcher] = {};
							watcherList[watcher]['callback'] = callback;
							watcherList[watcher]['watcherParams'] = watcherParams || null;
						
						// insta-notify if list is instant
							if(useCache === true && hasCache){

								cache = _self.cache[notice];

								_self._notifyWatcher(watcher, watcherList, {'noticeParams': cache, 'watcherParams': watcherParams});
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
								
								var params = {};
								params['noticeParams'] = message || null;
								params['watcherParams'] = _self.watchers[notice][watcher]['watcherParams'] || null;
								
								// inform watcher in a separate thread 
								_self._notifyWatcher(watcher, watcherList, params);
								
								// keep track of who has been informed
								informedWatchers.push(watcher);							
							}

						// cache notice
							if(typeof message !== "undefined"){ _self.cache[notice] = message; }
						
						// update log 
							if( !isLogging ){ _self.log("\n'" + notice.toUpperCase() + "' - " + "queue\n" + '<- Source: ' + source +  '\n-> Notified: ' + JSON.stringify(informedWatchers) + "\n" ); }

						return true;
					},

				/* watch ONCE */
				    once: function(notice, watcher, callback, options){

				    	var _self = this; 

				        _self.watch(
				            notice, 
				            watcher,

				            (function(callback, options){
							
								return function(data){

				                	callback({'noticeParams': data.noticeParams, 'watcherParams': options.watcherParams });
				                	_self.ignore(notice, watcher);				                	
				            	}
			            	})(callback, options),

			            	options
				        );
				    },

				    log: function(){

						var _self = this;

						if(_self.settings.logging === true){ _self.notify('log-entry', arguments); }
					}, 

					_notifyWatcher: function(watcher, watcherList, params){

						var _self = this;

						// inform watcher in a separate thread 
							setTimeout( (function(watcherList, watcher, params, _self) { 
								return function() {

									if( !watcherList[watcher] || typeof watcherList[watcher]['callback'] !== "function"){

										_self.log("ERROR: ", watcher, watcherList, params);
										return;
									}

									watcherList[watcher]['callback']({'notice': params.noticeParams, 'watcher': params.watcherParams});
								} 
							})(watcherList, watcher, params, _self), 0 );								
					}
			}

		// Create watcher List
			function createWatcherList(){ return []; }
		
		// Constructor
			function Noticeboard(settings){

				// set default values
					this.settings = settings || { logging: true };
					this.watchers = [];
					this.cache = [];
			}

			Noticeboard.prototype = codec;
			Noticeboard.prototype.constructor = Noticeboard;

			return Noticeboard; 
	}();