/**
 * Created by Ganapati on 5/14/17.
 *
 * flash-cache: Ultra fast in-memory cache.
 */

import LZW from './LZW';
import {on, off, emit} from './listeners';
import addToExpiryQueue from './addToExpiryQueue';

let _defaultConfig = {
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
module.exports = function flashCache(config = _defaultConfig) {
    let _cache = Object.create(null);

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
        put(key = '', value = '', expiryIn = _defaultConfig.defaultExpiryIn) {
            // Remove existing values, if any
            if (_cache[key]) {
                this.remove(key, true);
            }

            let __cache__ = {
                value,
                time: Date.now()
            };
            let {compressStrings} = config;

            // Compress and store strings
            if (compressStrings && typeof value === 'string') {
                __cache__._compressed = true;
                __cache__.value = LZW.compress(value);
            }

            // Ignore all falsy values(like `0` & `false`)
            // Basically if there is no expiry, cache will act as simple in-memory data store.
            if (expiryIn) {
                // Store timeout, might be required for later use
                __cache__.expiryAt = __cache__.time + expiryIn;

                let expiryFn = () => {
                    // Trigger `fc-expiry` event
                    this.emit('fc-expiry', {key, data: _cache[key]});

                    this.remove(key, true);
                };

                // Remove the cache after expiry time
                addToExpiryQueue(__cache__.expiryAt, key, expiryFn.bind(this));
            }

            _cache[key] = __cache__;

            // Trigger `fc-add` event
            this.emit('fc-add', {key, data: _cache[key]});

            return _cache[key];
        },

        /**
         * Get data from cache
         *
         * @param {String} key  Cache key
         * */
        get(key = '') {
            let __cache__ = _cache[key];

            if (__cache__) {
                // Extract private _compressed, _expirer function
                let {_expirer, _compressed, ...cache} = __cache__;

                // Make copy of cache
                cache = Object.assign({}, cache);

                // If data is compressed string, uncompress
                if (_compressed) {
                    cache.value = LZW.decompress(cache.value);
                }

                // Trigger `fc-get` event
                this.emit('fc-get', {key, data: cache});

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
        remove(key, isExpired = false) {
            let __cache__ = _cache[key];

            if (__cache__) {
                let {expiryAt} = __cache__;

                // If timer exists for the key, remove it
                if (_timers[expiryAt][key]) {
                    delete _timers[expiryAt][key];
                }

                // Remove key & value from cache
                delete _cache[key];

                // Trigger `fc-remove` event
                this.emit('fc-remove', {key, expired: isExpired});

                return true;
            }

            return false;
        },

        /**
         * Get entire cache
         * */
        getAll() {
            // Trigger `fc-get-all` event
            this.emit('fc-get-all', _cache);

            return _cache;
        },

        /**
         * Clear entire cache
         * */
        clearAll() {
            _cache = Object.create(null);

            // Trigger `fc-clear` event
            this.emit('fc-clear', {});

            return true;
        },

        /**
         * Event listeners
         * */
        on,
        off,
        emit
    }
};