# pure-cache

Cache with confidence 🎉

Ultra fast in-memory JavaScript cache with near realtime cache expiry feature ⚡

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

### UMD build

```html
<script src="https://unpkg.com/pure-cache/dist/pure-cache.umd.js"></script>
```

## Basic Usage

```js
import PureCache from 'pure-cache';
// or const PureCache = require('pure-cache');

// Create instance of cache store and set cache expiry timeout to 500ms
const cacheStore = new PureCache({ expiryCheckInterval: 500 });

// Setup a expiry listener, this will be called when data expires
const onExpiry = ({ key, data: { value, expiryAt } }) => {
    // Do something with expired key
    console.log(`Key:${key} with value:${value} expired at ${expiryAt}.`);
};
cacheStore.on('expiry', onExpiry);

// Put 'bar' data into 'foo' key in cache and configure it to expire after 30s
cacheStore.put('foo', 'bar', 30000);

// Get 'foo' key value from cache
cacheStore.get('foo'); // { value: 'bar', addedAt: 1527052395294, expiryAt: 1527052425294 }

// Wait till expiry time(basically 30+ seconds in this case)
const wait = t => new Promise(r => setTimeout(r, t));
await wait(31000);

// Now the cache will return null value for 'foo' key
cacheStore.get('foo'); // null

// remove listeners after you are done
cacheStore.off('expiry', onExpiry);

```

## Todo

- [ ] Update documentation with events and more examples

## License

MIT © [Ganapati V S](http://meetguns.com)
