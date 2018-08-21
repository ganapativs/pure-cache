# pure-cache

Cache with confidence 🎉

Ultra fast & Tiny(around 1kb gzipped) in-memory JavaScript cache with near realtime cache expiry feature ⚡

> Works in any JavaScript runtime(node or browser) ✨

[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)
[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ganapativs/pure-cache/)
[![Build Status](https://travis-ci.com/ganapativs/pure-cache.svg?branch=master)](https://travis-ci.com/ganapativs/pure-cache)
[![npm version](https://badge.fury.io/js/pure-cache.svg)](https://badge.fury.io/js/pure-cache)
[![GitHub version](https://badge.fury.io/gh/ganapativs%2Fpure-cache.svg)](https://badge.fury.io/gh/ganapativs%2Fpure-cache)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

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

## Usage

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

// IMPORTANT! When done, make sure you cleanup the instance
cacheStore.dispose();

```

## API

- [Pure Cache](docs/pureCache.md)
- [In Memory Expirer (Internal)](docs/inMemoryExpirer.md)

## Contribute

Thanks for taking time to contribute, please read [docs](docs) and checkout [src](src) to understand how things work.

### Reporting Issues

Found a problem? Want a new feature? First of all see if your issue or idea has [already been reported](../../issues).
If don't, just open a [new clear and descriptive issue](../../issues/new).

### Submitting pull requests

Pull requests are the greatest contributions, so be sure they are focused in scope, and do avoid unrelated commits.

- Fork it!
- Clone your fork: `git clone https://github.com/<your-username>/pure-cache`
- Navigate to the newly cloned directory: `cd pure-cache`
- Create a new branch for the new feature: `git checkout -b my-new-feature`
- Install the tools necessary for development: `yarn`
- Make your changes.
- Commit your changes: `git commit -am 'Add some feature'`
- Push to the branch: `git push origin my-new-feature`
- Submit a pull request with full remarks documenting your changes.

## License

[MIT License](https://opensource.org/licenses/MIT) © [Ganapati V S](http://meetguns.com)
