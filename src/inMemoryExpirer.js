import checkIfInstanceIsDisposed from "./utils/checkInstanceDisposal";
import defaultConfig from "./constants/inMemoryDefaultConfig";

/**
 * Near realtime expiry handler
 *
 * queue Structure:
 *  {
 *    time1: [{key: key1, onExpire: () => {}}, {key: key2, onExpire: () => {}}],
 *    time2: [{key: key3, onExpire: () => {}}]
 *  }
 */
class InMemoryExpirer {
  constructor(config = {}) {
    // Configuration
    this.config = { ...defaultConfig, ...config };

    // Expirer queue
    this.queue = {};

    // Instance dispose status
    this.disposed = false;

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
    checkIfInstanceIsDisposed(this.disposed);

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
   * @param {String} key key to store expiry data against
   * @param {Function} onExpire Expiry callback, called when Date.now() ~= time
   * */
  add(time, key, onExpire) {
    checkIfInstanceIsDisposed(this.disposed);

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
   * @param {String} key key to remove from the expiry queue
   * */
  remove(time, key) {
    checkIfInstanceIsDisposed(this.disposed);

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
   * Cleanup - Empty queue & clear expirer timer
   * */
  dispose() {
    checkIfInstanceIsDisposed(this.disposed);

    clearInterval(this.timer);
    this.timer = null;
    this.queue = {};
    this.disposed = true;

    return true;
  }
}

export default InMemoryExpirer;
