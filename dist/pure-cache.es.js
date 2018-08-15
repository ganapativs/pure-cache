import mitt from 'mitt';

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

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
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
    throw new Error("This instance is already disposed. Please create new instance and try again.");
  }
};

var Expirer =
/*#__PURE__*/
function () {
  /**
   * Default config
   * */
  function Expirer() {
    var _this = this;

    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Expirer);

    _defineProperty(this, "queue", {});

    _defineProperty(this, "defaultConfig", {
      // By default, check for cache expiry every 100 ms
      // Reducing this value might create performance issues
      expiryCheckInterval: 100
    });

    _defineProperty(this, "expire", function () {
      checkIfInstanceIsDisposed(_this.instanceDisposed);
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
    this.config = _objectSpread({}, this.defaultConfig, config); // Instance dispose status

    this.instanceDisposed = false; // Store last expired time to navigate from current expired time to last expired time
    // Set initial value to current time - 1
    // Don't set to 0 as expiry function will loop from current time to 0

    this.lastExpiredTime = Date.now() - 1; // Run the expiry function at every configured interval time

    var expiryCheckInterval = this.config.expiryCheckInterval;
    this.timer = setInterval(this.expire, expiryCheckInterval);
  }
  /**
   * Expiry function
   * */


  _createClass(Expirer, [{
    key: "add",

    /**
     * Add to expiry queue
     *
     * @param {Number} time  When to expire
     * @param {String} key Cache key
     * @param {Function} onExpire Expiry callback, called when Date.now() ~= time
     * */
    value: function add(time, key, onExpire) {
      checkIfInstanceIsDisposed(this.instanceDisposed);

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
     * @param {String} key Cache key to remove
     * */

  }, {
    key: "remove",
    value: function remove(time, key) {
      checkIfInstanceIsDisposed(this.instanceDisposed);
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
     * Cleanup
     *    - Empty queue
     *    - Clear expirer timer
     * */

  }, {
    key: "dispose",
    value: function dispose() {
      checkIfInstanceIsDisposed(this.instanceDisposed);
      clearInterval(this.timer);
      this.timer = null;
      this.queue = {};
      this.instanceDisposed = true;
      return true;
    }
  }]);

  return Expirer;
}();

var PureCache =
/*#__PURE__*/
function () {
  /**
   * Cache store
   * */

  /**
   * Default config
   * */
  function PureCache() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, PureCache);

    _defineProperty(this, "cacheStore", {});

    _defineProperty(this, "defaultConfig", {
      // Default cache expiry time, 60000ms(60s) by default
      // Set `false` to disable expiry(This beats the purpose of cache, the data is store until the instance is disposed)
      // Note: Falsy values like `0` will be treated as `false`
      defaultCacheExpiryIn: 60000,
      // By default, check for cache expiry every 100 ms
      // Reducing this value might create performance issues
      expiryCheckInterval: 100
    });

    // Configuration
    this.config = _objectSpread({}, this.defaultConfig, config); // Event listeners

    var _mitt = mitt(),
        on = _mitt.on,
        off = _mitt.off,
        emit = _mitt.emit;

    var _ref = [on, off, emit];
    this.on = _ref[0];
    this.off = _ref[1];
    this.emit = _ref[2];
    // Instance dispose status
    this.instanceDisposed = false; // Create cache expirer instance, which maintains its own expiry queue

    var expiryCheckInterval = this.config.expiryCheckInterval;
    this.cacheExpirer = new Expirer({
      expiryCheckInterval: expiryCheckInterval
    });
  }
  /**
   * Put data into cache
   *
   * @param {String} key  Cache key
   * @param {String|Object|*} value Value to be stored against cache key
   * @param {Number} expiryIn Expiry time for the key, defaults to defaultCacheExpiryIn
   * */


  _createClass(PureCache, [{
    key: "put",
    value: function put() {
      var _this = this;

      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config.defaultCacheExpiryIn;
      checkIfInstanceIsDisposed(this.instanceDisposed); // Remove existing values in the key(if any)

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
          _this.emit(Events.EXPIRY, {
            key: key,
            data: target
          });

          _this.remove(key);
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
     * Get data from cache
     *
     * @param {String} key  Cache key
     *
     * @returns {Object} Object { value, addedAt, expiryAt }
     * */

  }, {
    key: "get",
    value: function get() {
      var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
      checkIfInstanceIsDisposed(this.instanceDisposed);
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
     * Remove data from cache
     *
     * @param {String} key  Cache key to be removed
     * */

  }, {
    key: "remove",
    value: function remove(key) {
      checkIfInstanceIsDisposed(this.instanceDisposed);
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
     * Cleanup
     *    - Clear entire cache
     *    - Stop expirer
     * */

  }, {
    key: "dispose",
    value: function dispose() {
      var _this2 = this;

      checkIfInstanceIsDisposed(this.instanceDisposed);
      Object.keys(this.cacheStore).forEach(function (key) {
        return _this2.remove(key);
      });
      this.emit(Events.CLEAR, {});
      this.cacheExpirer.dispose();
      this.instanceDisposed = true;
      return true;
    }
  }]);

  return PureCache;
}();

export default PureCache;
//# sourceMappingURL=pure-cache.es.js.map
