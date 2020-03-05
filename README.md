# 介绍
-----

[![npm version](https://badge.fury.io/js/think_cache.svg)](https://badge.fury.io/js/think_cache)

Cache for ThinkKoa, support file, memcache, redis.

# 安装
-----

```
npm i think_cache
```

# 使用
-----

## Thinkkoa

1、项目中增加中间件 

```
think middleware cache
```

2、修改 middleware/cache.js:
```
module.exports = require('think_cache');
```

3、项目中间件配置 config/middleware.js:
```
list: [...,'cache'], //加载的中间件列表
config: { //中间件配置
    ...,
    cache: {
        type: 'file', //数据缓存类型 file,redis,memcache
        key_prefix: 'ThinkKoa:', //缓存key前置
        timeout: 6 * 3600, //数据缓存有效期，单位: 秒

        //type=file
        file_suffix: '.json', //File缓存方式下文件后缀名
        gc_hour: [4], //缓存清除的时间点，数据为小时
        file_path: process.env.ROOT_PATH + '/cache',

        //type=redis
        // host: '127.0.0.1',
        // port: 6379,
        // password: '',
        // db: '0',

        //type=memcache
        // host: '127.0.0.1',
        // port: 11211,

        poolsize: 10, //pool size
        conn_timeout: 5000, //try connection timeout
    }
}
```

## Koatty

1、项目中增加中间件

```shell
koatty middleware cache;
```

2、修改 middleware/Cache.ts:

```
import { Middleware } from "../core/Component";
import { Koatty } from "../Koatty";
const cache = require("think_cache");

@Middleware()
export class Cache {
    run(options: any, app: Koatty) {
        return cache(options, app);
    }
}
```

3、项目中间件配置 config/middleware.ts:
```
list: [...,'Cache'], //加载的中间件列表
config: { //中间件配置
    ...,
    Cache: {
        type: 'file', //数据缓存类型 file,redis,memcache
        key_prefix: 'ThinkKoa:', //缓存key前置
        timeout: 6 * 3600, //数据缓存有效期，单位: 秒

        //type=file
        file_suffix: '.json', //File缓存方式下文件后缀名
        gc_hour: [4], //缓存清除的时间点，数据为小时
        file_path: process.env.ROOT_PATH + '/cache',

        //type=redis
        // host: '127.0.0.1',
        // port: 6379,
        // password: '',
        // db: '0',

        //type=memcache
        // host: '127.0.0.1',
        // port: 11211,

        poolsize: 10, //pool size
        conn_timeout: 5000, //try connection timeout
    }
}




## 缓存
-----

```
// in controller
this.app.cacheStore.set(name, value);

//in middleware
app.cacheStore.set(name, value);

//redis lua stript
app.cacheClient.command(.command('redisIncrby', {
    numberOfKeys: 1,
    lua: `return redis.call("incrby",KEYS[1],ARGV[1])`
});

```