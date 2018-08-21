/**
 * Pure cache default config
 * */
const pureCacheDefaultConfig = {
  // Default cache expiry time, 60000ms(60s) by default
  // Set `false` to disable expiry(This beats the purpose of cache, the data is store until the instance is disposed)
  // Note: Falsy values like `0` will be treated as `false`
  defaultCacheExpiryIn: 60000,
  // By default, check for cache expiry every 100 ms
  // Reducing this value might create performance issues
  expiryCheckInterval: 100
};

export default pureCacheDefaultConfig;
