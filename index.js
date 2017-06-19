/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');
/**
 * default options
 */
const defaultOptions = {
    cache_type: 'file', //数据缓存类型 file,redis,memcache
    cache_key_prefix: 'ThinkKoa:', //缓存key前置
    cache_timeout: 6 * 3600, //数据缓存有效期，单位: 秒
    cache_file_suffix: '.json', //File缓存方式下文件后缀名
    cache_gc_hour: [4], //缓存清除的时间点，数据为小时
    cache_path: think.root_path + '/cache', //文件类缓存目录

    memcache_host: '127.0.0.1',
    memcache_port: 11211,
    memcache_poolsize: 10, //memcache pool size
    memcache_timeout: 10, //try connection timeout, 

    redis_host: '127.0.0.1',
    redis_port: 6379,
    redis_password: '',
    redis_db: '0',
    redis_timeout: 10, //try connection timeout
};

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    think.app.once('appReady', () => {
        options.cache_key_prefix = (~((options.cache_key_prefix).indexOf(':'))) ? `${options.cache_key_prefix}Cache:` : `${options.cache_key_prefix}:Cache:`;
        think._caches._stores = require(`./lib/adapter/${options.cache_type || 'file'}.js`);

        lib.define(think, 'cache', function (name, value, option) {
            try {
                if (lib.isNumber(option)) {
                    options.cache_timeout = option;
                } else if (option === null) {
                    options.cache_timeout = null;
                }

                let instance = new (think._caches._stores)(options);
                if (value === undefined) {
                    return instance.get(name).then(val => {
                        return lib.isJSONStr(val) ? JSON.parse(val) : val;
                    });
                } else if (value === null) {
                    return instance.rm(name);
                } else {
                    return instance.set(name, (lib.isBoolean(value) || lib.isNumber(value) || lib.isString(value)) ? value : JSON.stringify(value), options.cache_timeout);
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