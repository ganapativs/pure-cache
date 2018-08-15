# pure-cache

Cache with confidence 🎉

Ultra fast & simple JavaScript cache with near realtime cache expiry feature ⚡

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ganapativs/pure-cache/)
[![Build Status](https://travis-ci.com/ganapativs/pure-cache.svg?branch=master)](https://travis-ci.com/ganapativs/pure-cache)
[![npm version](https://badge.fury.io/js/pure-cache.svg)](https://badge.fury.io/js/pure-cache)
[![GitHub version](https://badge.fury.io/gh/ganapativs%2Fpure-cache.svg)](https://badge.fury.io/gh/ganapativs%2Fpure-cache)

## Installation

### NPM

```sh
npm install pure-cache
```

### Yarn

```sh
yarn add pure-cache
```

## Basic Usage

```javascript
import PureCache from 'pure-cache';

// Create instance of cache store
const cacheStore = new PureCache({ expiryCheckInterval: 500 });

// Put 'bar' data into 'foo' key in cache and configure it to expire after 30s
cacheStore.put('foo', 'bar', 30000);

// Get 'foo' key value from cache
cacheStore.get('foo'); // { value: 'bar', addedAt: 1527052395294, expiryAt: 1527052425294 }

// Wait till expiry time
await wait(31000);

// Now the cache will return null value for 'foo' key
cacheStore.get('foo'); // null

```

## Todo

- [ ] Update documentation with events and more examples

## License

MIT © [Ganapati V S](http://meetguns.com)
