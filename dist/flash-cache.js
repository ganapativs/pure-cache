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
	
	var _LZW = __webpack_require__(1);
	
	var _LZW2 = _interopRequireDefault(_LZW);
	
	var _listeners = __webpack_require__(2);
	
	var _addToExpiryQueue = __webpack_require__(3);
	
	var _addToExpiryQueue2 = _interopRequireDefault(_addToExpiryQueue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; } /**
	                                                                                                                                                                                                                              * Created by Ganapati on 5/14/17.
	                                                                                                                                                                                                                              *
	                                                                                                                                                                                                                              * flash-cache: Ultra fast in-memory cache.
	                                                                                                                                                                                                                              */
	
	var _defaultConfig = {
	    // Default cache expiry time, 60000ms(60s) by default.
	    // Set `false` to disable expiry(This beats the purpose of cache).
	    // `0` will be treated as `false`.
	    defaultExpiryIn: 60000,
	    // Should compress the data if data is string, will save some bytes, but more processing!
	    compressStrings: true
	};
	
	/**
	 * flash-cache: Ultra fast in-memory cache.
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
	            var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultConfig.defaultExpiryIn;
	
	            // Remove existing values, if any
	            if (_cache[key]) {
	                this.remove(key, true);
	            }
	
	            var __cache__ = {
	                value: value,
	                time: Date.now()
	            };
	            var compressStrings = config.compressStrings;
	
	            // Compress and store strings
	
	            if (compressStrings && typeof value === 'string') {
	                __cache__._compressed = true;
	                __cache__.value = _LZW2.default.compress(value);
	            }
	
	            // Ignore all falsy values(like `0` & `false`)
	            // Basically if there is no expiry, cache will act as simple in-memory data store.
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
	                // Extract private _compressed, _expirer function
	                var _expirer = __cache__._expirer,
	                    _compressed = __cache__._compressed,
	                    cache = _objectWithoutProperties(__cache__, ['_expirer', '_compressed']);
	
	                // Make copy of cache
	
	
	                cache = Object.assign({}, cache);
	
	                // If data is compressed string, uncompress
	                if (_compressed) {
	                    cache.value = _LZW2.default.decompress(cache.value);
	                }
	
	                // Trigger `fc-get` event
	                this.emit('fc-get', { key: key, data: cache });
	
	                return cache;
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
	
	                if (_timers[expiryAt][key]) {
	                    delete _timers[expiryAt][key];
	                }
	
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

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Lempel-Ziv-Welch (LZW) Compression/Decompression algorithm for Strings
	 * http://rosettacode.org/wiki/LZW_compression#JavaScript
	 *
	 * let str = "Lorem Ipsum is simply dummy text of the printing and typesetting industry.
	 * Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
	 * when an unknown printer took a galley of type and scrambled it to make a type specimen book.
	 * It has survived not only five centuries, but also the leap into electronic typesetting,
	 * remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset
	 * sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
	 * Aldus PageMaker including versions of Lorem Ipsum.";
	 *
	 * console.log(str.length) // 574
	 *
	 * let compressed = LZW.compress(str) // 358
	 *
	 * let uncompressed = LZW.decompress(str) // 574
	 */
	
	exports.default = {
	    compress: function compress(uncompressed) {
	        "use strict";
	        // Build the dictionary.
	
	        var i = void 0,
	            dictionary = {},
	            c = void 0,
	            wc = void 0,
	            w = "",
	            result = [],
	            dictSize = 256;
	        for (i = 0; i < 256; i += 1) {
	            dictionary[String.fromCharCode(i)] = i;
	        }
	
	        for (i = 0; i < uncompressed.length; i += 1) {
	            c = uncompressed.charAt(i);
	            wc = w + c;
	            // Do not use dictionary[wc] because javascript arrays
	            // will return values for array['pop'], array['push'] etc
	            // if (dictionary[wc]) {
	            if (dictionary.hasOwnProperty(wc)) {
	                w = wc;
	            } else {
	                result.push(dictionary[w]);
	                // Add wc to the dictionary.
	                dictionary[wc] = dictSize++;
	                w = String(c);
	            }
	        }
	
	        // Output the code for w.
	        if (w !== "") {
	            result.push(dictionary[w]);
	        }
	        return result;
	    },
	    decompress: function decompress(compressed) {
	        "use strict";
	        // Build the dictionary.
	
	        var i = void 0,
	            dictionary = [],
	            w = void 0,
	            result = void 0,
	            k = void 0,
	            entry = "",
	            dictSize = 256;
	        for (i = 0; i < 256; i += 1) {
	            dictionary[i] = String.fromCharCode(i);
	        }
	
	        w = String.fromCharCode(compressed[0]);
	        result = w;
	        for (i = 1; i < compressed.length; i += 1) {
	            k = compressed[i];
	            if (dictionary[k]) {
	                entry = dictionary[k];
	            } else {
	                if (k === dictSize) {
	                    entry = w + w.charAt(0);
	                } else {
	                    return null;
	                }
	            }
	
	            result += entry;
	
	            // Add w+entry[0] to the dictionary.
	            dictionary[dictSize++] = w + entry.charAt(0);
	
	            w = entry;
	        }
	        return result;
	    }
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Created by Ganapati on 6/24/17.
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
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * Created by Ganapati on 7/05/17.
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
	 * Check for keys expiry each 1 millisecond unless all keys are expired.
	 *
	 * Cleanup current + old keys(If any)
	 *
	 * If no keys exists to expire, stop timer or if timer is not started, attach timer.
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
	
	exports.default = _addToExpiryQueue;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=flash-cache.js.map