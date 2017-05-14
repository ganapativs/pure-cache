/**
 * Created by Ganapati on 5/14/17.
 */

import LZW from './LZW';
import {Stringify, isExisty} from './util';

let _defaultConfig = {
    // Cache expiry time, 1000ms by default
    // Set `false` to disable expiry(This beats the purpose of cache).
    // `0` will be treated as `false`
    expireIn: 1000,
    // Should compress the data, will save some bytes, but more processing
    compress: false
};

/**
 * flash-cache: Ultra fast in memory cache for simple data.
 *
 * Warning: Use flashCache to save only simple data, do not save scoped
 * variables like objects with functions as they will be lost if
 * compress option is true (Input will be stringified)
 */
export default function flashCache(config = _defaultConfig) {
    let _listeners = Object.create(null);

    return {
        /**
         * Expose cache, useful to get entire cache
         * */
        _cache: Object.create(null),

        /**
         * Expose config copy for future use
         * */
        _config: Object.assign({}, config),

        /**
         * Put data into cache
         *
         * @param {String} key  Cache key
         * @param {String|Object} value Value to be stored against cache key
         * */
        put(key = '', value = '') {
            let __cache__ = {
                value,
                time: Date.now()
            };
            let {compress, expireIn} = config;

            if (compress) {
                __cache__._compressed = true;
                __cache__.value = LZW.compress(Stringify(value));
            }

            // Ignore both `0` & `false`
            if (expireIn) {
                // Store timeout, might be required for later use
                __cache__.expiryAt = __cache__.time + expireIn;

                // Remove the cache after expiry time
                __cache__._expirer = setTimeout(() => {
                    // Trigger `expiry` event
                    this.emit('expiry', {key, data: this._cache[key]});

                    this.remove(key, true);
                }, expireIn);
            }

            this._cache[key] = __cache__;

            // Trigger `add` event
            this.emit('add', {key, data: this._cache[key]});

            return true;
        },

        /**
         * Get data from cache
         *
         * @param {String} key  Cache key
         * */
        get(key = '') {
            let __cache__ = this._cache[key];

            if (__cache__) {
                // Extract private _compressed, _expirer function
                let {_expirer, _compressed, ...cache} = __cache__;

                // Make copy of cache
                cache = Object.assign({}, cache);

                if (_compressed) {
                    cache.value = LZW.decompress(cache.value);
                }

                // Trigger `get` event
                this.emit('get', {key, data: cache});

                return cache;
            }

            return null;
        },

        /**
         * Remove data from cache
         *
         * @param {String} key  Cache key to be removed
         * @param {Boolean} isExpired  Boolean to indicate whether cache is removed by expiry timeout
         * */
        remove(key, isExpired = false) {
            let __cache__ = this._cache[key];

            if (__cache__) {
                let {_expirer} = __cache__;

                if (isExisty(_expirer)) {
                    clearTimeout(_expirer);
                }

                delete this._cache[key];

                // Trigger `remove` event
                this.emit('remove', {key, expired: isExpired});

                return true;
            }

            return false;
        },

        /**
         * Add cache event listener
         * Snippet borrowed from @developit/mitt
         *
         * @param {String} type  Event to register, Eg: add, remove, expiry
         * @param {String|Object} listener Function to be called on event
         * */
        on(type, listener) {
            if (typeof listener === 'function') {
                (_listeners[type] || (_listeners[type] = [])).push(listener);
            }
        },

        /**
         * Remove cache event listener
         * Snippet borrowed from @developit/mitt
         *
         * @param {String} type  Event to un register, Eg: add, remove, expiry
         * @param {String|Object} listener function to remove
         * */
        off(type, listener) {
            if (_listeners[type]) {
                _listeners[type].splice(_listeners[type].indexOf(listener) >>> 0, 1);
            }
        },

        /**
         * Emit data to cache event listeners
         * Snippet borrowed from @developit/mitt
         *
         * @param {String} type  Event to be emited
         * @param {String|Object} data to pass to listener function
         * */
        emit(type, data) {
            (_listeners[type] || []).map((handler) => {
                handler(data);
            });
            (_listeners['*'] || []).map((handler) => {
                handler(type, data);
            });
        }
    }
}