import mitt from "mitt";
import Events from "./constants/events";
import InMemoryExpirer from "./inMemoryExpirer";
import checkIfInstanceIsDisposed from "./utils/checkInstanceDisposal";
import defaultConfig from "./constants/pureCacheDefaultConfig";

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
class PureCache {
  constructor(config = {}, Expirer = InMemoryExpirer) {
    // Configuration
    this.config = Object.assign({}, defaultConfig, config);

    // Event listeners
    const { on, off, emit } = mitt();
    [this.on, this.off, this.emit] = [on, off, emit];

    // Cache store
    this.cacheStore = {};

    // Instance dispose status
    this.disposed = false;

    // Create cache expirer instance, which maintains its own expiry queue
    const { expiryCheckInterval } = this.config;
    this.cacheExpirer = new Expirer({ expiryCheckInterval });
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
  put(key = "", value = "", expiryIn = this.config.defaultCacheExpiryIn) {
    checkIfInstanceIsDisposed(this.disposed);

    // Remove existing values in the key(if any)
    if (this.cacheStore[key]) {
      this.remove(key);
    }

    const addedAt = Date.now();
    // Ignore all falsy values(like `0` & `false`)
    // Basically if there is no expiry, cache will act as simple in-memory data store
    const expiryAt = expiryIn ? addedAt + expiryIn : null;
    const target = { value, addedAt, expiryAt };
    this.cacheStore[key] = target;

    // If expiry time exists, add to expiry queue
    if (expiryAt) {
      // Remove value from cache and trigger expiry event
      const onExpire = () => {
        this.emit(Events.EXPIRY, {
          key,
          data: target
        });
        this.remove(key);
      };

      this.cacheExpirer.add(expiryAt, key, onExpire);
    }
    this.emit(Events.ADD, { key, data: target });

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
  get(key = "") {
    checkIfInstanceIsDisposed(this.disposed);

    const target = this.cacheStore[key];

    if (target) {
      this.emit(Events.GET, { key, data: target });
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
  remove(key) {
    checkIfInstanceIsDisposed(this.disposed);

    const target = this.cacheStore[key];

    if (target) {
      // Remove key & value from cache
      delete this.cacheStore[key];
      const { expiryAt } = target;
      // If timer exists for the key, remove it
      this.cacheExpirer.remove(expiryAt, key);
      this.emit(Events.REMOVE, { key, data: target });

      return true;
    }

    return false;
  }

  /**
   * Cleanup - Clear entire cache & stop expirer
   *
   * @returns {Boolean} Returns `true`
   * */
  dispose() {
    checkIfInstanceIsDisposed(this.disposed);

    Object.keys(this.cacheStore).forEach(key => this.remove(key));
    this.emit(Events.CLEAR, {});
    this.cacheExpirer.dispose();
    this.disposed = true;

    return true;
  }
}

export default PureCache;
