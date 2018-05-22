(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/core-js/object/keys", "@babel/runtime/helpers/extends", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/createClass", "mitt", "./constants/events", "./expirer"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/core-js/object/keys"), require("@babel/runtime/helpers/extends"), require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/createClass"), require("mitt"), require("./constants/events"), require("./expirer"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.keys, global._extends, global.classCallCheck, global.createClass, global.mitt, global.events, global.expirer);
    global.flashCache = mod.exports;
  }
})(this, function (_exports, _keys, _extends2, _classCallCheck2, _createClass2, _mitt2, _events, _expirer) {
  "use strict";

  var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _keys = _interopRequireDefault(_keys);
  _extends2 = _interopRequireDefault(_extends2);
  _classCallCheck2 = _interopRequireDefault(_classCallCheck2);
  _createClass2 = _interopRequireDefault(_createClass2);
  _mitt2 = _interopRequireDefault(_mitt2);
  _events = _interopRequireDefault(_events);
  _expirer = _interopRequireDefault(_expirer);

  /**
   * flash-cache: Ultra fast JavaScript data cache with near realtime cache expiry ⚡
   *
   * cacheStore Structure:
   *    {
   *      key1: value1,
   *      key2: value2,
   *      ...
   *    }
   */
  var flashCache =
  /*#__PURE__*/
  function () {
    /**
     * Cache store
     * */

    /**
     * Default config
     * */
    function flashCache() {
      var _this = this;

      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      (0, _classCallCheck2.default)(this, flashCache);
      Object.defineProperty(this, "cacheStore", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {}
      });
      Object.defineProperty(this, "defaultConfig", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {
          // Default cache expiry time, 60000ms(60s) by default
          // Set `false` to disable expiry(This beats the purpose of cache, the data is store until the instance is disposed)
          // Note: Falsy values like `0` will be treated as `false`
          defaultCacheExpiryIn: 60000,
          // By default, check for cache expiry every 100 ms
          // Reducing this value might create performance issues
          expiryCheckInterval: 100
        }
      });
      Object.defineProperty(this, "checkIfInstanceIsDisposed", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function value() {
          if (_this.instanceDisposed) {
            throw new Error("This instance is already disposed. Please create new instance and try again.");
          }
        }
      });
      // Configuration
      this.config = (0, _extends2.default)({}, this.defaultConfig, config); // Event listeners

      var _mitt = (0, _mitt2.default)(),
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
      this.cacheExpirer = new _expirer.default({
        expiryCheckInterval: expiryCheckInterval
      });
    }

    (0, _createClass2.default)(flashCache, [{
      key: "put",

      /**
       * Put data into cache
       *
       * @param {String} key  Cache key
       * @param {String|Object|*} value Value to be stored against cache key
       * @param {Number} expiryIn Expiry time for the key, defaults to defaultCacheExpiryIn
       * */
      value: function put() {
        var _this2 = this;

        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config.defaultCacheExpiryIn;
        this.checkIfInstanceIsDisposed(); // Remove existing values in the key(if any)

        if (this.cacheStore[key]) {
          this.remove(key);
        }

        var time = Date.now(); // Ignore all falsy values(like `0` & `false`)
        // Basically if there is no expiry, cache will act as simple in-memory data store

        var expiryAt = expiryIn ? time + expiryIn : null;
        var target = {
          value: value,
          time: time,
          expiryAt: expiryAt
        };
        this.cacheStore[key] = target; // If expiry time exists, add to expiry queue

        if (expiryAt) {
          // Remove value from cache and trigger expiry event
          this.cacheExpirer.add(expiryAt, key, function onExpire() {
            _this2.emit(_events.default.FC_EXPIRY, {
              key: key,
              data: target
            });

            _this2.remove(key, true);
          });
        }

        this.emit(_events.default.FC_ADD, {
          key: key,
          data: target
        });
        return target;
      }
      /**
       * Get data from cache
       *
       * @param {String} key  Cache key
       * */

    }, {
      key: "get",
      value: function get() {
        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        this.checkIfInstanceIsDisposed();
        var target = this.cacheStore[key];

        if (target) {
          this.emit(_events.default.FC_GET, {
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
       * @param {Boolean} shouldEmit  Boolean to indicate the event should be emitted or not
       * */

    }, {
      key: "remove",
      value: function remove(key) {
        var shouldEmit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        this.checkIfInstanceIsDisposed();
        var target = this.cacheStore[key];

        if (target) {
          // Remove key & value from cache
          delete this.cacheStore[key];
          var expiryAt = target.expiryAt; // If timer exists for the key, remove it

          this.cacheExpirer.remove(expiryAt, key);

          if (shouldEmit) {
            this.emit(_events.default.FC_REMOVE, {
              key: key,
              data: target
            });
          }

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
        var _this3 = this;

        this.checkIfInstanceIsDisposed();
        (0, _keys.default)(this.cacheStore).forEach(function (key) {
          return _this3.remove(key);
        });
        this.emit(_events.default.FC_CLEAR, {});
        this.cacheExpirer.dispose();
        this.instanceDisposed = true;
        return true;
      }
    }]);
    return flashCache;
  }();

  _exports.default = flashCache;
});