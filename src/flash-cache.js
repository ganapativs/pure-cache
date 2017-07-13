/**
 * Created by Ganapati on 5/14/17
 *
 * flash-cache: Ultra fast in-memory cache
 */

import {on, off, emit} from './listeners';
import Events from './events';
import addToExpiryQueue, {deleteTimerAtKey} from './addToExpiryQueue';

let _defaultConfig = {
    // Default cache expiry time, 60000ms(60s) by default
    // Set `false` to disable expiry(This beats the purpose of cache)
    // `0` will be treated as `false`
    defaultExpiryIn: 60000
};

/**
 * flash-cache: Ultra fast in-memory cache
 */
module.exports = function flashCache(config = _defaultConfig) {
    let _cache = Object.create(null);

    return {
        /**
         * Remove value from cache and trigger expiry event
         *
         * Exposing here to prevent creation of multiple function instances
         * */
        _expiryFn(key, data) {
            // Trigger `FC_EXPIRY` event
            this.emit(Events.FC_EXPIRY, {key, data});

            this.remove(key, true);
        },

        /**
         * Put data into cache
         *
         * @param {String} key  Cache key
         * @param {String|Object} value Value to be stored against cache key
         * @param {Number} expiryIn Expiry time for the key, defaults to defaultExpiryIn
         * */
        put(key = '', value = '', expiryIn = config.defaultExpiryIn) {
            // Remove existing values in the key, if any
            if (_cache[key]) {
                this.remove(key, true);
            }

            let __cache__ = {
                value,
                time: Date.now()
            };

            __cache__.value = value;

            // Ignore all falsy values(like `0` & `false`)
            // Basically if there is no expiry, cache will act as simple in-memory data store
            if (expiryIn) {
                // Store timeout, might be required for later use
                __cache__.expiryAt = __cache__.time + expiryIn;
            }

            _cache[key] = __cache__;

            // If expiry time exists, add to expiry queue
            if (__cache__.expiryAt) {
                // Remove the cache after expiry time
                addToExpiryQueue(__cache__.expiryAt, key, this._expiryFn.bind(this, key, _cache[key]));
            }

            // Trigger `FC_ADD` event
            this.emit(Events.FC_ADD, {key, data: _cache[key]});

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
                // Make a new copy of cache
                // Note: this won't remove nested references
                let nCache = Object.assign({}, __cache__);

                // Trigger `FC_GET` event
                this.emit(Events.FC_GET, {key, data: nCache});

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
        remove(key, isExpired = false) {
            let __cache__ = _cache[key];

            if (__cache__) {
                let {expiryAt} = __cache__;

                // If timer exists for the key, remove it
                deleteTimerAtKey(expiryAt, key);

                // Remove key & value from cache
                delete _cache[key];

                // Trigger `FC_REMOVE` event
                this.emit(Events.FC_REMOVE, {key, expired: isExpired});

                return true;
            }

            return false;
        },

        /**
         * Get current cache configuration
         * */
        getConfig() {
            return Object.assign({}, config);
        },

        /**
         * Get entire cache
         * */
        getAll() {
            // Trigger `FC_GET_ALL` event
            this.emit(Events.FC_GET_ALL, _cache);

            return _cache;
        },

        /**
         * Clear entire cache
         * */
        clearAll() {
            _cache = Object.create(null);

            // Trigger `FC_CLEAR` event
            this.emit(Events.FC_CLEAR, {});

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