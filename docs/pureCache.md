<a name="PureCache"></a>

## PureCache
pure-cache: Cache with confidence 🎉 Ultra fast in-memory JavaScript cache with near realtime cache expiry feature ⚡

cacheStore Structure:
   {
     key1: { value: value1, addedAt: 1527012874728, expiryAt: 1527012879729 },
     key2: { value: value2, addedAt: 1527012908893, expiryAt: 1527012909880 },
     ...
   }

**Kind**: global class  

* [PureCache](#PureCache)
    * [.put(key, value, expiryIn)](#PureCache+put) ⇒ <code>Object</code>
    * [.get(key)](#PureCache+get) ⇒ <code>Object</code> \| <code>null</code>
    * [.remove(key)](#PureCache+remove) ⇒ <code>Boolean</code>
    * [.dispose()](#PureCache+dispose) ⇒ <code>Boolean</code>

<a name="PureCache+put"></a>

### pureCache.put(key, value, expiryIn) ⇒ <code>Object</code>
Put data into the cache

**Kind**: instance method of [<code>PureCache</code>](#PureCache)  
**Returns**: <code>Object</code> - Newly added Object({ value, addedAt, expiryAt }) with `value` key consists of actual data  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Cache key |
| value | <code>String</code> \| <code>Object</code> \| <code>\*</code> | Value to be stored against cache key |
| expiryIn | <code>Number</code> | Expiry time(in ms from now), defaults to `60000ms(60s)`,                          if set to falsy values(like `0` & `false`), cache will                          act as simple in-memory data store and data is never expired for the key |

<a name="PureCache+get"></a>

### pureCache.get(key) ⇒ <code>Object</code> \| <code>null</code>
Get data from the cache

**Kind**: instance method of [<code>PureCache</code>](#PureCache)  
**Returns**: <code>Object</code> \| <code>null</code> - If `key` found, returns Object({ value, addedAt, expiryAt })
                       with `value` key consists of actual data, else returns `null`  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Cache key |

<a name="PureCache+remove"></a>

### pureCache.remove(key) ⇒ <code>Boolean</code>
Remove data from the cache

**Kind**: instance method of [<code>PureCache</code>](#PureCache)  
**Returns**: <code>Boolean</code> - If `key` found, returns `true`,else returns `false`  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Cache key to be removed from the cache |

<a name="PureCache+dispose"></a>

### pureCache.dispose() ⇒ <code>Boolean</code>
Cleanup - Clear entire cache & stop expirer

**Kind**: instance method of [<code>PureCache</code>](#PureCache)  
**Returns**: <code>Boolean</code> - Returns `true`  
