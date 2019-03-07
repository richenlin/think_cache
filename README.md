# 介绍
-----

[![npm version](https://badge.fury.io/js/think_cache.svg)](https://badge.fury.io/js/think_cache)
[![Dependency Status](https://david-dm.org/thinkkoa/think_cache.svg)](https://david-dm.org/thinkkoa/think_cache)

Cache for ThinkKoa, support file, memcache, redis.

# 安装
-----

```
npm i think_cache
```

# 使用
-----

1、项目中增加中间件 middleware/cache.js
```
module.exports = require('think_cache');
```

2、项目中间件配置 config/middleware.js:
```
list: [...,'cache'], //加载的中间件列表
config: { //中间件配置
    ...,
    cache: {
        cache_type: 'file', //数据缓存类型 file,redis,memcache
        cache_key_prefix: 'ThinkKoa:', //缓存key前置
        cache_timeout: 6 * 3600, //数据缓存有效期，单位: 秒

        //cache_type=file
        file_suffix: '.json', //File缓存方式下文件后缀名
        file_path: process.env.APP_PATH + '/cache'

        //cache_type=redis
        //redis_host: '127.0.0.1',
        //redis_port: 6379,
        //redis_password: '',
        //redis_db: '0',
        //redis_timeout: 10, //try connection timeout

        //cache_type=memcache
        //memcache_host: '127.0.0.1',
        //memcache_port: 11211,
        //memcache_poolsize: 10, //memcache pool size
        //memcache_timeout: 10, //try connection timeout,
    }
}
```

3、使用

```
// in controller
this.app.cache(name, value);

//in middleware
app.cache(name, value);

```