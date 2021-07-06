'use strict';

var mitt = require('mitt');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var mitt__default = /*#__PURE__*/_interopDefaultLegacy(mitt);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

/**
 * Events list
 */
var Events = {
  EXPIRY: "expiry",
  ADD: "add",
  GET: "get",
  REMOVE: "remove",
  CLEAR: "clear"
};

var checkIfInstanceIsDisposed = function checkIfInstanceIsDisposed(instanceDisposed) {
  if (instanceDisposed) {
    throw new Error("Cannot use disposed instance.");
  }
};

/**
 * In memory default config
 * */
var inMemoryDefaultConfig = {
  // By default, check for cache expiry every 100 ms
  // Reducing this value might create performance issues
  expiryCheckInterval: 100
};

/**
 * Near realtime expiry handler
 *
 * queue Structure:
 *  {
 *    time1: [{key: key1, onExpire: () => {}}, {key: key2, onExpire: () => {}}],
 *    time2: [{key: key3, onExpire: () => {}}]
 *  }
 */

var InMemoryExpirer = /*#__PURE__*/function () {
  function InMemoryExpirer() {
    var _this = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, InMemoryExpirer);

    _defineProperty(this, "expire", function () {
      checkIfInstanceIsDisposed(_this.disposed);
      var time = Date.now();

      for (var t = time; t >= _this.lastExpiredTime; t -= 1) {
        var toExpire = _this.queue[t];

        if (toExpire) {
          delete _this.queue[t];
          toExpire.forEach(function (_ref) {
            var key = _ref.key,
                onExpire = _ref.onExpire;
            return onExpire(key);
          });
        }
      }

      _this.lastExpiredTime = time;
    });

    // Configuration
    this.config = _objectSpread2(_objectSpread2({}, inMemoryDefaultConfig), config); // Expirer queue

    this.queue = {}; // Instance dispose status

    this.disposed = false; // Store last expired time to navigate from current expired time to last expired time
    // Set initial value to current time - 1
    // Don't set to 0 as expiry function will loop from current time to 0

    this.lastExpiredTime = Date.now() - 1; // Run the expiry function at every configured interval time

    var expiryCheckInterval = this.config.expiryCheckInterval;
    this.timer = setInterval(this.expire, expiryCheckInterval);
  }
  /**
   * Expiry function
   * */


  _createClass(InMemoryExpirer, [{
    key: "add",
    value:
    /**
     * Add to expiry queue
     *
     * @param {Number} time  When to expire
     * @param {String} key key to store expiry data against
     * @param {Function} onExpire Expiry callback, called when Date.now() ~= time
     * */
    function add(time, key, onExpire) {
      checkIfInstanceIsDisposed(this.disposed);

      if (!this.queue[time]) {
        this.queue[time] = [];
      }

      this.queue[time].push({
        key: key,
        onExpire: onExpire
      });
      return true;
    }
    /**
     * Remove specific key from expiry queue
     *
     * @param {Number} time  Expiry time
     * @param {String} key key to remove from the expiry queue
     * */

  }, {
    key: "remove",
    value: function remove(time, key) {
      checkIfInstanceIsDisposed(this.disposed);
      var queue = this.queue[time];

      if (queue) {
        // Filter out keys in queue[time] which are matching current remove key
        var filteredQueue = queue.filter(function (_ref2) {
          var k = _ref2.key;
          return k !== key;
        });

        if (!filteredQueue.length) {
          delete this.queue[time];
        } else {
          this.queue[time] = filteredQueue;
        }

        return true;
      }

      return false;
    }
    /**
     * Cleanup - Empty queue & clear expirer timer
     * */

  }, {
    key: "dispose",
    value: function dispose() {
      checkIfInstanceIsDisposed(this.disposed);
      clearInterval(this.timer);
      this.timer = null;
      this.queue = {};
      this.disposed = true;
      return true;
    }
  }]);

  return InMemoryExpirer;
}();

/**
 * Pure cache default config
 * */
var pureCacheDefaultConfig = {
  // Default cache expiry time, 60000ms(60s) by default
  // Set `false` to disable expiry(This beats the purpose of cache, the data is store until the instance is disposed)
  // Note: Falsy values like `0` will be treated as `false`
  defaultCacheExpiryIn: 60000,
  // By default, check for cache expiry every 100 ms
  // Reducing this value might create performance issues
  expiryCheckInterval: 100
};

/**
 * pure-cache: Cache with confidence 🎉 Ultra fast in-memory JavaScript cache with near realtime cache expiry feature ⚡
 *
 * cacheStore Structure:
 *    {
 *      key1: { value: value1, addedAt: 1527012874728, expiryAt: 1527012879729 },
 *      key2: { value: value2, addedAt: 1527012908893, expiryAt: 1527012909880 },
 *      ...
 *    }
 */

var PureCache = /*#__PURE__*/function () {
  function PureCache() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var Expirer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : InMemoryExpirer;

    _classCallCheck(this, PureCache);

    // Configuration
    this.config = _objectSpread2(_objectSpread2({}, pureCacheDefaultConfig), config); // Event listeners

    var _mitt = mitt__default['default'](),
        on = _mitt.on,
        off = _mitt.off,
        emit = _mitt.emit;

    var _ref = [on, off, emit];
    this.on = _ref[0];
    this.off = _ref[1];
    this.emit = _ref[2];
    // Cache store
    this.cacheStore = {}; // Instance dispose status

    this.disposed = false; // Create cache expirer instance, which maintains its own expiry queue

    var expiryCheckInterval = this.config.expiryCheckInterval;
    this.cacheExpirer = new Expirer({
      expiryCheckInterval: expiryCheckInterval
    });
  }
  /**
   * Put data into the cache
   *
   * @param {String} key  Cache key
   * @param {String|Object|*} value Value to be stored against cache key
   * @param {Number} expiryIn Expiry time(in ms from now), defaults to `60000ms(60s)`,
   *                          if set to falsy values(like `0` & `false`), cache will
   *                          act as simple in-memory data store and data is never expired for the key
   *
   * @returns {Object} Newly added Object({ value, addedAt, expiryAt }) with `value` key consists of actual data
   * */


  _createClass(PureCache, [{
    key: "put",
    value: function put() {
      var _this = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config.defaultCacheExpiryIn;
      checkIfInstanceIsDisposed(this.disposed); // Remove existing values in the key(if any)

      if (this.cacheStore[key]) {
        this.remove(key);
      }

      var addedAt = Date.now(); // Ignore all falsy values(like `0` & `false`)
      // Basically if there is no expiry, cache will act as simple in-memory data store

      var expiryAt = expiryIn ? addedAt + expiryIn : null;
      var target = {
        value: value,
        addedAt: addedAt,
        expiryAt: expiryAt
      };
      this.cacheStore[key] = target; // If expiry time exists, add to expiry queue

      if (expiryAt) {
        // Remove value from cache and trigger expiry event
        var onExpire = function onExpire() {
          _this.remove(key);

          _this.emit(Events.EXPIRY, {
            key: key,
            data: _this.cacheStore[key]
          });
        };

        this.cacheExpirer.add(expiryAt, key, onExpire);
      }

      this.emit(Events.ADD, {
        key: key,
        data: target
      });
      return target;
    }
    /**
     * Get data from the cache
     *
     * @param {String} key  Cache key
     *
     * @returns {Object|null} If `key` found, returns Object({ value, addedAt, expiryAt })
     *                        with `value` key consists of actual data, else returns `null`
     * */

  }, {
    key: "get",
    value: function get() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      checkIfInstanceIsDisposed(this.disposed);
      var target = this.cacheStore[key];

      if (target) {
        this.emit(Events.GET, {
          key: key,
          data: target
        });
        return target;
      }

      return null;
    }
    /**
     * Remove data from the cache
     *
     * @param {String} key  Cache key to be removed from the cache
     *
     * @returns {Boolean} If `key` found, returns `true`,else returns `false`
     * */

  }, {
    key: "remove",
    value: function remove(key) {
      checkIfInstanceIsDisposed(this.disposed);
      var target = this.cacheStore[key];

      if (target) {
        // Remove key & value from cache
        delete this.cacheStore[key];
        var expiryAt = target.expiryAt; // If timer exists for the key, remove it

        this.cacheExpirer.remove(expiryAt, key);
        this.emit(Events.REMOVE, {
          key: key,
          data: target
        });
        return true;
      }

      return false;
    }
    /**
     * Cleanup - Clear entire cache & stop expirer
     *
     * @returns {Boolean} Returns `true`
     * */

  }, {
    key: "dispose",
    value: function dispose() {
      var _this2 = this;

      checkIfInstanceIsDisposed(this.disposed);
      Object.keys(this.cacheStore).forEach(function (key) {
        return _this2.remove(key);
      });
      this.emit(Events.CLEAR, {});
      this.cacheExpirer.dispose();
      this.disposed = true;
      return true;
    }
  }]);

  return PureCache;
}();

module.exports = PureCache;
//# sourceMappingURL=pure-cache.js.map
