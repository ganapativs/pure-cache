/**
 * Near realtime expiry handler
 *
 * queue Structure:
 *  {
 *    time1: [{key: key1, onExpire: () => {}}, {key: key2, onExpire: () => {}}],
 *    time2: [{key: key3, onExpire: () => {}}]
 *  }
 */

export default class Expirer {
  queue = {};

  constructor({ expiryCheckInterval = 100 }) {
    /**
     * Run the expiry function at every configured interval time
     */
    this.timer = setInterval(this.expire, expiryCheckInterval);
  }

  /**
   * Expiry function
   * */
  expire = () => {
    const time = Date.now();

    // Extract all keys which are less than or equal to current keys
    const keysToExpire = Object.keys(this.queue).filter(
      t => parseInt(t, 10) <= time
    );

    for (let i = 0; i < keysToExpire.length; i += 1) {
      const current = keysToExpire[i];
      const toExpire = this.queue[current];

      if (toExpire) {
        delete this.queue[current];
        toExpire.forEach(({ key, onExpire }) => onExpire(key));
      }
    }
  };

  /**
   * Add to expiry queue
   *
   * @param {Number} time  When to expire
   * @param {String} key Cache key
   * @param {Function} onExpire Expiry callback, called when Date.now() ~= time
   * */
  add(time, key, onExpire) {
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
    clearInterval(this.timer);
    this.queue = {};
    return true;
  }
}
