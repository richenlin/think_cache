'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');
const base = require('../base.js');
const memcachesocket = require('../socket/memcache.js');
var _cacheInstances = {};

module.exports = class extends base {
    constructor(options = {}) {
        super(options);
        let key = lib.md5(`${this.options.memcache_host}_${this.options.memcache_port}`);
        if (!(key in _cacheInstances)) {
            _cacheInstances[key] = new memcachesocket(this.options);
        }
        this.handle = _cacheInstances[key];
    }

    /**
     *
     * @param name
     */
    get(name) {
        return this.handle.wrap('get', [this.options.cache_key_prefix + name]);
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout = this.options.cache_timeout) {
        return this.handle.wrap('set', [this.options.cache_key_prefix + name, (0, _stringify2.default)(value), timeout]);
    }

    /**
     *
     * @param name
     */
    rm(name) {
        return this.handle.wrap('del', [this.options.cache_key_prefix + name]);
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout = this.options.cache_timeout) {
        return this.handle.wrap('touch', [this.options.cache_key_prefix + name, timeout]);
    }

    /**
     * 自增
     * @param name
     */
    incr(name) {
        return this.handle.wrap('incr', [this.options.cache_key_prefix + name, 1]);
    }

    /**
     * 自减
     * @param name
     * @returns {*}
     */
    decr(name) {
        return this.handle.wrap('decr', [this.options.cache_key_prefix + name, 1]);
    }
};