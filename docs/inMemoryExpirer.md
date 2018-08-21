<a name="InMemoryExpirer"></a>

## InMemoryExpirer
Near realtime expiry handler

queue Structure:
 {
   time1: [{key: key1, onExpire: () => {}}, {key: key2, onExpire: () => {}}],
   time2: [{key: key3, onExpire: () => {}}]
 }

**Kind**: global class  

* [InMemoryExpirer](#InMemoryExpirer)
    * [.expire](#InMemoryExpirer+expire)
    * [.add(time, key, onExpire)](#InMemoryExpirer+add)
    * [.remove(time, key)](#InMemoryExpirer+remove)
    * [.dispose()](#InMemoryExpirer+dispose)

<a name="InMemoryExpirer+expire"></a>

### inMemoryExpirer.expire
Expiry function

**Kind**: instance property of [<code>InMemoryExpirer</code>](#InMemoryExpirer)  
<a name="InMemoryExpirer+add"></a>

### inMemoryExpirer.add(time, key, onExpire)
Add to expiry queue

**Kind**: instance method of [<code>InMemoryExpirer</code>](#InMemoryExpirer)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | When to expire |
| key | <code>String</code> | key to store expiry data against |
| onExpire | <code>function</code> | Expiry callback, called when Date.now() ~= time |

<a name="InMemoryExpirer+remove"></a>

### inMemoryExpirer.remove(time, key)
Remove specific key from expiry queue

**Kind**: instance method of [<code>InMemoryExpirer</code>](#InMemoryExpirer)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | Expiry time |
| key | <code>String</code> | key to remove from the expiry queue |

<a name="InMemoryExpirer+dispose"></a>

### inMemoryExpirer.dispose()
Cleanup - Empty queue & clear expirer timer

**Kind**: instance method of [<code>InMemoryExpirer</code>](#InMemoryExpirer)  
