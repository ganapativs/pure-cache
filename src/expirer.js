/**
 * Expirer
 */

export default class Expirer {
  queue = {};
  timer = setInterval(this.expire, 1);

  /**
   * Add to expiry queue
   *
   * @param {Number} time  When to expire
   * @param {String} key Cache key
   * @param {Function} cb Expiry callback, called when Date.now() === time
   * */
  add(time, key, cb) {
    if (!this.queue[time]) {
      this.queue[time] = [];
    }
    this.queue[time].push({ key, cb });
  }

  /**
   * Expiry function
   * Don't block main thread, let the timer run every ms
   * */
  async expire() {
    const time = Date.now();
    const toExpire = this.queue[time];

    if (toExpire) {
      toExpire.forEach(({ key, cb }) => cb(key));
      delete this.queue[time];
    }
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
      const filteredQueue = queue.filter(({ k }) => k !== key);
      if (!filteredQueue.length) {
        delete this.queue[time];
      } else {
        this.queue[time] = filteredQueue;
      }
    }
  }

  /**
   * Cleanup
   *    - Empty queue
   *    - Clear expirer timer
   * */
  destroy() {
    clearInterval(this.timer);
    this.queue = {};
    return true;
  }
}
