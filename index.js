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
    conn_timeout: 5000, //try connection timeout, 
};

module.exports = function (options, app) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    options.type = options.type || 'file'; //数据缓存类型 file,redis,memcache
    options.key_prefix = (~((options.key_prefix).indexOf(':'))) ? `${options.key_prefix}Cache:` : `${options.key_prefix}:Cache:`; //缓存key前缀
    options.timeout = options.timeout || 6 * 3600; //数据缓存有效期，单位: 秒

    const storeConn = async function (opt) {
        const cacheStore = new store(opt);
        lib.define(app, 'cacheStore', cacheStore, true);

        if (opt.type !== 'file') {
            const cacheClient = await cacheStore.connect();
            lib.define(app, 'cacheClient', cacheClient, true);
        }
    };

    //应用启动执行一次
    app.once('appReady', async () => {
        await storeConn(options);
    });

    return async function (ctx, next) {
        if (!app.cacheStore || (app.cacheStore.connect && (!app.cacheClient || app.cacheClient.status !== 'ready'))) {
            await storeConn(options);
        }

        return next();
    };
};