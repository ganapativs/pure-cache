/**
 * Created by Ganapati on 6/24/17.
 *
 * Event listeners
 */

let _listeners = Object.create(null);

/**
 * Add cache event listener
 * Snippet borrowed from @developit/mitt
 *
 * @param {String} type  Event to register, Eg: add, remove, expiry
 * @param {String|Object} listener Function to be called on event
 * */
let on = (type, listener) => {
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
let off = (type, listener) => {
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
let emit = (type, data) => {
    (_listeners[type] || []).map((handler) => {
        handler(data);
    });
    (_listeners['*'] || []).map((handler) => {
        handler(type, data);
    });
};

export default {on, off, emit};