'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');

module.exports = class {
    constructor(options = {}) {
        this.options = lib.extend({
            cache_type: 'file', //数据缓存类型 file,redis,memcache
            cache_key_prefix: 'ThinkKoa:', //缓存key前置
            cache_timeout: 6 * 3600, //数据缓存有效期，单位: 秒
            cache_file_suffix: '.json', //File缓存方式下文件后缀名
            cache_gc_hour: [4], //缓存清除的时间点，数据为小时
            cache_path: __dirname
        }, options);
    }
};