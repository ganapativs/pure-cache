/**
 * Near realtime expiry handler
 *
 * queue Structure:
 *  {
 *    time1: [{key: key1, onExpire: () => {}}, {key: key2, onExpire: () => {}}],
 *    time2: [{key: key3, onExpire: () => {}}]
 *  }
 */
import checkIfInstanceIsDisposed from "./utils/checkInstanceDisposal";

export default class Expirer {
  queue = {};

  /**
   * Default config
   * */
  defaultConfig = {
    // By default, check for cache expiry every 100 ms
    // Reducing this value might create performance issues
    expiryCheckInterval: 100
  };

  constructor(config = {}) {
    // Configuration
    this.config = { ...this.defaultConfig, ...config };

    // Instance dispose status
    this.instanceDisposed = false;

    // Store last expired time to navigate from current expired time to last expired time
    // Set initial value to current time - 1
    // Don't set to 0 as expiry function will loop from current time to 0
    this.lastExpiredTime = Date.now() - 1;

    // Run the expiry function at every configured interval time
    const { expiryCheckInterval } = this.config;
    this.timer = setInterval(this.expire, expiryCheckInterval);
  }

  /**
   * Expiry function
   * */
  expire = () => {
    checkIfInstanceIsDisposed(this.instanceDisposed);

    const time = Date.now();

    for (let t = time; t >= this.lastExpiredTime; t -= 1) {
      const toExpire = this.queue[t];

      if (toExpire) {
        delete this.queue[t];
        toExpire.forEach(({ key, onExpire }) => onExpire(key));
      }
    }

    this.lastExpiredTime = time;
  };

  /**
   * Add to expiry queue
   *
   * @param {Number} time  When to expire
   * @param {String} key Cache key
   * @param {Function} onExpire Expiry callback, called when Date.now() ~= time
   * */
  add(time, key, onExpire) {
    checkIfInstanceIsDisposed(this.instanceDisposed);

    if (!this.queue[time]) {
      this.queue[time] = [];
    }

    this.queue[time].push({ key, onExpire });

    return true;
  }

  /**
   * Remove specific key from expiry queue
   *
   * @param {Number} time  Expiry time
   * @param {String} key Cache key to remove
   * */
  remove(time, key) {
    checkIfInstanceIsDisposed(this.instanceDisposed);

    const queue = this.queue[time];

    if (queue) {
      // Filter out keys in queue[time] which are matching current remove key
      const filteredQueue = queue.filter(({ key: k }) => k !== key);
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
  dispose() {
    checkIfInstanceIsDisposed(this.instanceDisposed);

    clearInterval(this.timer);
    this.timer = null;
    this.queue = {};
    this.instanceDisposed = true;

    return true;
  }
}
