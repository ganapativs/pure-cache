(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "@babel/runtime/core-js/object/keys", "@babel/runtime/helpers/extends", "@babel/runtime/helpers/classCallCheck", "@babel/runtime/helpers/createClass", "mitt", "./constants/events", "./expirer", "./utils/newObjectReference"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("@babel/runtime/core-js/object/keys"), require("@babel/runtime/helpers/extends"), require("@babel/runtime/helpers/classCallCheck"), require("@babel/runtime/helpers/createClass"), require("mitt"), require("./constants/events"), require("./expirer"), require("./utils/newObjectReference"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.keys, global._extends, global.classCallCheck, global.createClass, global.mitt, global.events, global.expirer, global.newObjectReference);
    global.flashCache = mod.exports;
  }
})(this, function (_exports, _keys, _extends2, _classCallCheck2, _createClass2, _mitt, _events, _expirer, _newObjectReference) {
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
  _mitt = _interopRequireDefault(_mitt);
  _events = _interopRequireDefault(_events);
  _expirer = _interopRequireDefault(_expirer);
  _newObjectReference = _interopRequireDefault(_newObjectReference);

  /**
   * flash-cache: Ultra fast in-memory cache
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

    /**
     * Event listeners
     * */

    /**
     * Cache expirer queue
     */
    function flashCache() {
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
          // Set `false` to disable expiry(This beats the purpose of cache)
          // `0` will be treated as `false`
          defaultExpiryIn: 60000
        }
      });
      Object.defineProperty(this, "events", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: (0, _mitt.default)()
      });
      Object.defineProperty(this, "on", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.events.on
      });
      Object.defineProperty(this, "off", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.events.off
      });
      Object.defineProperty(this, "emit", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: this.events.emit
      });
      Object.defineProperty(this, "expirer", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: new _expirer.default()
      });
      this.config = (0, _extends2.default)({}, this.defaultConfig, config);
    }
    /**
     * Put data into cache
     *
     * @param {String} key  Cache key
     * @param {String|Object} value Value to be stored against cache key
     * @param {Number} expiryIn Expiry time for the key, defaults to defaultExpiryIn
     * */


    (0, _createClass2.default)(flashCache, [{
      key: "put",
      value: function put() {
        var _this = this;

        var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
        var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        var expiryIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config.defaultExpiryIn;

        // Remove existing values in the key(if any)
        if (this.cacheStore[key]) {
          this.remove(key);
        }

        var time = Date.now(); // Ignore all falsy values(like `0` & `false`)
        // Basically if there is no expiry, cache will act as simple in-memory data store

        var target = {
          value: value,
          time: time,
          expiryAt: expiryIn ? time + expiryIn : null
        };
        this.cacheStore[key] = target; // If expiry time exists, add to expiry queue

        if (target.expiryAt) {
          // Remove value from cache and trigger expiry event
          this.expirer.add(target.expiryAt, key, function cb() {
            _this.emit(_events.default.FC_EXPIRY, {
              key: key,
              data: (0, _newObjectReference.default)(_this.cacheStore[key])
            });

            _this.remove(key, true);
          });
        }

        var targetCopy = (0, _newObjectReference.default)(this.cacheStore[key]);
        this.emit(_events.default.FC_ADD, {
          key: key,
          data: targetCopy
        });
        return targetCopy;
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
        var target = this.cacheStore[key];

        if (target) {
          // Make a new copy of cache
          var targetCopy = (0, _newObjectReference.default)(target);
          this.emit(_events.default.FC_GET, {
            key: key,
            data: targetCopy
          });
          return targetCopy;
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
        var target = this.cacheStore[key];

        if (target) {
          var targetCopy = (0, _newObjectReference.default)(target);
          var expiryAt = targetCopy.expiryAt; // If timer exists for the key, remove it

          this.expirer.remove(expiryAt, key); // Remove key & value from cache

          delete this.cacheStore[key];

          if (shouldEmit) {
            this.emit(_events.default.FC_REMOVE, {
              key: key,
              data: targetCopy
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
      key: "destroy",
      value: function destroy() {
        var _this2 = this;

        (0, _keys.default)(this.cacheStore).forEach(function (key) {
          return _this2.remove(key);
        });
        this.emit(_events.default.FC_CLEAR, {});
        this.expirer.destroy();
        return true;
      }
    }]);
    return flashCache;
  }();

  _exports.default = flashCache;
});