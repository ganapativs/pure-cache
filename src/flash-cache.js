/**
 * flash-cache: Ultra fast in-memory cache
 */
import mitt from "mitt";
import Events from "./constants/events";
import Expirer from "./expirer";
import newObjectReference from "./utils/newObjectReference";

export default class flashCache {
  /**
   * Cache store
   * */
  cacheStore = {};

  /**
   * Default config
   * */
  defaultConfig = {
    // Default cache expiry time, 60000ms(60s) by default
    // Set `false` to disable expiry(This beats the purpose of cache)
    // `0` will be treated as `false`
    defaultExpiryIn: 60000
  };

  /**
   * Event listeners
   * */
  events = mitt();
  on = this.events.on;
  off = this.events.off;
  emit = this.events.emit;

  /**
   * Cache expirer queue
   */
  expirer = new Expirer();

  constructor(config = {}) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * Put data into cache
   *
   * @param {String} key  Cache key
   * @param {String|Object} value Value to be stored against cache key
   * @param {Number} expiryIn Expiry time for the key, defaults to defaultExpiryIn
   * */
  put(key = "", value = "", expiryIn = this.config.defaultExpiryIn) {
    // Remove existing values in the key(if any)
    if (this.cacheStore[key]) {
      this.remove(key);
    }

    const time = Date.now();
    // Ignore all falsy values(like `0` & `false`)
    // Basically if there is no expiry, cache will act as simple in-memory data store
    const target = { value, time, expiryAt: expiryIn ? time + expiryIn : null };
    this.cacheStore[key] = target;

    // If expiry time exists, add to expiry queue
    if (target.expiryAt) {
      // Remove value from cache and trigger expiry event
      const cb = () => {
        this.emit(Events.FC_EXPIRY, {
          key,
          data: newObjectReference(this.cacheStore[key])
        });
        this.remove(key, true);
      };
      this.expirer.add(target.expiryAt, key, cb);
    }

    const targetCopy = newObjectReference(this.cacheStore[key]);
    this.emit(Events.FC_ADD, { key, data: targetCopy });
    return targetCopy;
  }

  /**
   * Get data from cache
   *
   * @param {String} key  Cache key
   * */
  get(key = "") {
    const target = this.cacheStore[key];

    if (target) {
      // Make a new copy of cache
      const targetCopy = newObjectReference(target);
      this.emit(Events.FC_GET, { key, data: targetCopy });
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
  remove(key, shouldEmit = false) {
    const target = this.cacheStore[key];

    if (target) {
      const targetCopy = newObjectReference(target);
      const { expiryAt } = targetCopy;
      // If timer exists for the key, remove it
      this.expirer.remove(expiryAt, key);
      // Remove key & value from cache
      delete this.cacheStore[key];
      if (shouldEmit) {
        this.emit(Events.FC_REMOVE, { key, data: targetCopy });
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
  destroy() {
    Object.keys(this.cacheStore).forEach(key => this.remove(key));
    this.emit(Events.FC_CLEAR, {});
    this.expirer.destroy();
    return true;
  }
}
