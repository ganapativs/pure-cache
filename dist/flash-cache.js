(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["flashCache"] = factory();
	else
		root["flashCache"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _listeners = __webpack_require__(1);
	
	var _addToExpiryQueue = __webpack_require__(2);
	
	var _addToExpiryQueue2 = _interopRequireDefault(_addToExpiryQueue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Created by Ganapati on 5/14/17
	 *
	 * flash-cache: Ultra fast in-memory cache
	 */
	
	var _defaultConfig = {
	    // Default cache expiry time, 60000ms(60s) by default
	    // Set `false` to disable expiry(This beats the purpose of cache)
	    // `0` will be treated as `false`
	    defaultExpiryIn: 60000
	};
	
	/**
	 * flash-cache: Ultra fast in-memory cache
	 */
	module.exports = function flashCache() {
	    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultConfig;
	
	    var _cache = Object.create(null);
	
	    return {
	        /**
	         * Expose config copy for future use
	         * */
	        _config: Object.assign({}, config),
	
	        /**
	         * Put data into cache
	         *
	         * @param {String} key  Cache key
	         * @param {String|Object} value Value to be stored against cache key
	         * @param {Number} expiryIn Expiry time for the key, defaults to defaultExpiryIn
	         * */
	        put: function put() {
	            var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	
	            var _this = this;
	
	            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	            var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : config.defaultExpiryIn;
	
	            // Remove existing values in the key, if any
	            if (_cache[key]) {
	                this.remove(key, true);
	            }
	
	            var __cache__ = {
	                value: value,
	                time: Date.now()
	            };
	
	            __cache__.value = value;
	
	            // Ignore all falsy values(like `0` & `false`)
	            // Basically if there is no expiry, cache will act as simple in-memory data store
	            if (expiryIn) {
	                // Store timeout, might be required for later use
	                __cache__.expiryAt = __cache__.time + expiryIn;
	
	                var expiryFn = function expiryFn() {
	                    // Trigger `fc-expiry` event
	                    _this.emit('fc-expiry', { key: key, data: _cache[key] });
	
	                    _this.remove(key, true);
	                };
	
	                // Remove the cache after expiry time
	                (0, _addToExpiryQueue2.default)(__cache__.expiryAt, key, expiryFn.bind(this));
	            }
	
	            _cache[key] = __cache__;
	
	            // Trigger `fc-add` event
	            this.emit('fc-add', { key: key, data: _cache[key] });
	
	            return _cache[key];
	        },
	
	
	        /**
	         * Get data from cache
	         *
	         * @param {String} key  Cache key
	         * */
	        get: function get() {
	            var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	
	            var __cache__ = _cache[key];
	
	            if (__cache__) {
	                // Make a new copy of cache
	                // Note: this won't remove nested references
	                var nCache = Object.assign({}, __cache__);
	
	                // Trigger `fc-get` event
	                this.emit('fc-get', { key: key, data: nCache });
	
	                return nCache;
	            }
	
	            return null;
	        },
	
	
	        /**
	         * Remove data/Invalidate from cache
	         *
	         * @param {String} key  Cache key to be removed
	         * @param {Boolean} isExpired  Boolean to indicate whether cache is removed by expiry timeout
	         * */
	        remove: function remove(key) {
	            var isExpired = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	
	            var __cache__ = _cache[key];
	
	            if (__cache__) {
	                var expiryAt = __cache__.expiryAt;
	
	                // If timer exists for the key, remove it
	
	                (0, _addToExpiryQueue.deleteTimerAtKey)(expiryAt, key);
	
	                // Remove key & value from cache
	                delete _cache[key];
	
	                // Trigger `fc-remove` event
	                this.emit('fc-remove', { key: key, expired: isExpired });
	
	                return true;
	            }
	
	            return false;
	        },
	
	
	        /**
	         * Get entire cache
	         * */
	        getAll: function getAll() {
	            // Trigger `fc-get-all` event
	            this.emit('fc-get-all', _cache);
	
	            return _cache;
	        },
	
	
	        /**
	         * Clear entire cache
	         * */
	        clearAll: function clearAll() {
	            _cache = Object.create(null);
	
	            // Trigger `fc-clear` event
	            this.emit('fc-clear', {});
	
	            return true;
	        },
	
	
	        /**
	         * Event listeners
	         * */
	        on: _listeners.on,
	        off: _listeners.off,
	        emit: _listeners.emit
	    };
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Created by Ganapati on 6/24/17
	 *
	 * Event listeners
	 */
	
	var _listeners = Object.create(null);
	
	/**
	 * Add cache event listener
	 * Snippet borrowed from @developit/mitt
	 *
	 * @param {String} type  Event to register, Eg: add, remove, expiry
	 * @param {String|Object} listener Function to be called on event
	 * */
	var on = exports.on = function on(type, listener) {
	    if (typeof listener === 'function') {
	        (_listeners[type] || (_listeners[type] = [])).push(listener);
	    }
	};
	
	/**
	 * Remove cache event listener
	 * Snippet borrowed from @developit/mitt
	 *
	 * @param {String} type  Event to un register, Eg: add, remove, expiry
	 * @param {String|Object} listener function to remove
	 * */
	var off = exports.off = function off(type, listener) {
	    if (_listeners[type]) {
	        _listeners[type].splice(_listeners[type].indexOf(listener) >>> 0, 1);
	    }
	};
	
	/**
	 * Emit data to cache event listeners
	 * Snippet borrowed from @developit/mitt
	 *
	 * @param {String} type  Event to be emited
	 * @param {String|Object} data to pass to listener function
	 * */
	var emit = exports.emit = function emit(type, data) {
	    (_listeners[type] || []).map(function (handler) {
	        handler(data);
	    });
	    (_listeners['*'] || []).map(function (handler) {
	        handler(type, data);
	    });
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Created by Ganapati on 7/05/17
	 *
	 * Timers - Expire cache on time(on regular intervals)
	 */
	
	/**
	 * Check if variable has some value
	 * */
	var isExisty = function isExisty(val) {
	    return val !== null && val !== undefined;
	};
	
	/**
	 * Store each key's expiry functions in _timers[expiryAt][key]
	 * */
	var _timers = {};
	var _expiryTimerInstance = null;
	
	/**
	 * Expire all keys at time(key) - _timers[time] & remove key from _timers
	 * */
	var _cleanUpTimers = function _cleanUpTimers(key) {
	    if (_timers[key]) {
	        for (var k in _timers[key]) {
	            if (_timers[key].hasOwnProperty(k)) {
	                _timers[key][k]();
	            }
	        }
	        delete _timers[key];
	    }
	};
	
	/**
	 * Check for keys expiry each 1 millisecond unless all keys are expired
	 *
	 * Cleanup current + old keys(If any)
	 *
	 * If no keys exists to expire, stop timer or if timer is not started, attach timer
	 * */
	var _checkExpired = function _checkExpired() {
	    var keys = Object.keys(_timers);
	    var remainingExpiries = keys.length;
	    var now = Date.now();
	    var isTimerActive = isExisty(_expiryTimerInstance);
	
	    keys.map(function (k) {
	        if (k <= now) {
	            _cleanUpTimers(k);
	            remainingExpiries -= 1;
	        }
	    });
	
	    if (!remainingExpiries) {
	        clearInterval(_expiryTimerInstance);
	        _expiryTimerInstance = null;
	    } else if (!isTimerActive) {
	        _expiryTimerInstance = setInterval(_checkExpired, 1);
	    }
	};
	
	/**
	 * Add expiryFn to _timers[expiryAt][key] & start timer if timer not attached
	 * */
	var _addToExpiryQueue = function _addToExpiryQueue(expiryAt, key, expiryFn) {
	    if (!_timers[expiryAt]) {
	        _timers[expiryAt] = {};
	    }
	    _timers[expiryAt][key] = expiryFn;
	    _checkExpired();
	};
	
	var deleteTimerAtKey = exports.deleteTimerAtKey = function deleteTimerAtKey(expiryAt, key) {
	    if (_timers[expiryAt][key]) {
	        delete _timers[expiryAt][key];
	    }
	};
	
	exports.default = _addToExpiryQueue;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=flash-cache.js.map