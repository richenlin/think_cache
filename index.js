/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');
const store = require('think_store');
/**
 * default options
 */
const defaultOptions = {
    cache_type: 'file', //数据缓存类型 file,redis,memcache
    cache_key_prefix: 'ThinkKoa:', //缓存key前置
    cache_timeout: 6 * 3600, //数据缓存有效期，单位: 秒

    //cache_type=file
    file_suffix: '.json', //File缓存方式下文件后缀名
    file_path: process.env.APP_PATH + '/cache',

    //cache_type=redis
    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_password: '',
    redis_db: '0',
    redis_timeout: 10, //try connection timeout

    //cache_type=memcache
    memcache_host: '127.0.0.1',
    memcache_port: 11211,
    memcache_poolsize: 10, //memcache pool size
    memcache_timeout: 10, //try connection timeout,
};

module.exports = function (options, app) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    app.once('appReady', () => {
        options.type = options.cache_type || 'file'; //数据缓存类型 file,redis,memcache
        options.key_prefix = (~((options.cache_key_prefix).indexOf(':'))) ? `${options.cache_key_prefix}Cache:` : `${options.cache_key_prefix}:Cache:`; //缓存key前缀
        options.timeout = options.cache_timeout || 6 * 3600; //数据缓存有效期，单位: 秒
        
        app._caches.store = store.getInstance(options);

        lib.define(app, 'cache', function (name, value, option) {
            try {
                if (lib.isNumber(option)) {
                    options.cache_timeout = option;
                } else if (option === null) {
                    options.cache_timeout = null;
                }
                if (value === undefined) {
                    return app._caches.store.get(name).then(val => {
                        return lib.isJSONStr(val) ? JSON.parse(val) : val;
                    });
                } else if (value === null) {
                    return app._caches.store.rm(name);
                } else {
                    return app._caches.store.set(name, (lib.isBoolean(value) || lib.isNumber(value) || lib.isString(value)) ? value : JSON.stringify(value), options.cache_timeout);
                }
            } catch (e) {
                return null;
            }
        });
        return;
    });

    return function (ctx, next) {
        return next();
    };
};