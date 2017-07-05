/**
 * Created by Ganapati on 7/05/17
 *
 * Timers - Expire cache on time(on regular intervals)
 */

/**
 * Check if variable has some value
 * */
let isExisty = (val) => val !== null && val !== undefined;

/**
 * Store each key's expiry functions in _timers[expiryAt][key]
 * */
let _timers = {};
let _expiryTimerInstance = null;

/**
 * Expire all keys at time(key) - _timers[time] & remove key from _timers
 * */
let _cleanUpTimers = (key) => {
    if (_timers[key]) {
        for (let k in _timers[key]) {
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
let _checkExpired = () => {
    let keys = Object.keys(_timers);
    let remainingExpiries = keys.length;
    let now = Date.now();
    let isTimerActive = isExisty(_expiryTimerInstance);

    keys.map(k => {
        if (k <= now) {
            _cleanUpTimers(k);
            remainingExpiries -= 1;
        }
    });

    if (!remainingExpiries) {
        clearInterval(_expiryTimerInstance);
        _expiryTimerInstance = null;
    }
    else if (!isTimerActive) {
        _expiryTimerInstance = setInterval(_checkExpired, 1);
    }
};

/**
 * Add expiryFn to _timers[expiryAt][key] & start timer if timer not attached
 * */
let _addToExpiryQueue = (expiryAt, key, expiryFn) => {
    if (!_timers[expiryAt]) {
        _timers[expiryAt] = {};
    }
    _timers[expiryAt][key] = expiryFn;
    _checkExpired();
};

export let deleteTimerAtKey = (expiryAt, key) => {
    if (_timers[expiryAt][key]) {
        delete _timers[expiryAt][key];
    }
};

export default _addToExpiryQueue;