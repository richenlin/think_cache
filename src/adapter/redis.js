/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');
const base = require('../base.js');
const redissocket = require('../socket/redis.js');
var _cacheInstances = {};

module.exports = class extends base {
    constructor(options = {}) {
        super(options);
        let key = lib.md5(`${this.options.redis_host}_${this.options.redis_port}_${this.options.redis_db}`);
        if (!(key in _cacheInstances)) {
            _cacheInstances[key] = new redissocket(this.options);
        }
        this.handle = _cacheInstances[key];
    }

    /**
     * 字符串获取
     * @param name
     */
    get(name) {
        return this.handle.wrap('get', [this.options.cache_key_prefix + name]);
    }

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */
    set(name, value, timeout = this.options.cache_timeout) {
        let setP = [this.handle.wrap('set', [this.options.cache_key_prefix + name, value])];
        if (typeof timeout === 'number') {
            setP.push(this.handle.wrap('expire', [this.options.cache_key_prefix + name, timeout]));
        }
        return Promise.all(setP);
    }

    /**
     * 以秒为单位，返回给定 key 的剩余生存时间
     * @param name
     * @returns {*}
     */
    ttl(name) {
        return this.handle.wrap('ttl', [this.options.cache_key_prefix + name]);
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout = this.options.cache_timeout) {
        return this.handle.wrap('expire', [this.options.cache_key_prefix + name, timeout]);
    }

    /**
     * 删除key
     * @param name
     */
    rm(name) {
        return this.handle.wrap('del', [this.options.cache_key_prefix + name]);
    }

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */
    batchrm(keyword) {
        return this.handle.wrap('keys', keyword + '*').then(keys => {
            if (lib.isEmpty(keys)) {
                return null;
            }
            return this.handle.wrap('del', [keys]);
        });
    }

    /**
     * 判断key是否存在
     * @param name
     */
    exists(name) {
        return this.handle.wrap('exists', [this.options.cache_key_prefix + name]);
    }

    /**
     * 查找所有符合给定模式 pattern 的 key
     * @param pattern
     */
    keys(pattern) {
        return this.handle.wrap('keys', [pattern]);
    }

    /**
     * 自增
     * @param name
     */
    incr(name) {
        return this.handle.wrap('incr', [this.options.cache_key_prefix + name]);
    }

    /**
     * 自减
     * @param name
     * @returns {*}
     */
    decr(name) {
        return this.handle.wrap('decr', [this.options.cache_key_prefix + name]);
    }

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */
    incrby(name, incr) {
        incr = incr || 1;
        return this.handle.wrap('incrby', [this.options.cache_key_prefix + name, incr]);
    }

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */
    hset(name, key, value, timeout = this.options.cache_timeout) {
        let setP = [this.handle.wrap('hset', [this.options.cache_key_prefix + name, key, value])];
        if (typeof timeout === 'number') {
            setP.push(this.handle.wrap('expire', [this.options.cache_key_prefix + name, timeout]));
        }
        return Promise.all(setP);
    }

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */
    hget(name, key) {
        return this.handle.wrap('hget', [this.options.cache_key_prefix + name, key]);
    }

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */
    hexists(name, key) {
        return this.handle.wrap('hexists', [this.options.cache_key_prefix + name, key]);
    }

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */
    hlen(name) {
        return this.handle.wrap('hlen', [this.options.cache_key_prefix + name]);
    }

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */
    hincrby(name, key, incr = 1) {
        return this.handle.wrap('hincrby', [this.options.cache_key_prefix + name, key, incr]);
    }

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */
    hgetall(name) {
        return this.handle.wrap('hgetall', [this.options.cache_key_prefix + name]);
    }

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */
    hkeys(name) {
        return this.handle.wrap('hkeys', [this.options.cache_key_prefix + name]);
    }

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */
    hvals(name) {
        return this.handle.wrap('hvals', [this.options.cache_key_prefix + name]);
    }

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */
    hdel(name, key) {
        return this.handle.wrap('hdel', [this.options.cache_key_prefix + name, key]);
    }

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */
    llen(name) {
        return this.handle.wrap('llen', [this.options.cache_key_prefix + name]);
    }

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */
    rpush(name, value) {
        return this.handle.wrap('rpush', [this.options.cache_key_prefix + name, value]);
    }

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */
    lpop(name) {
        return this.handle.wrap('lpop', [this.options.cache_key_prefix + name]);
    }

    /**
     * 返回列表 key 中指定区间内的元素，区间以偏移量 start 和 stop 指定
     * @param name
     * @param start
     * @param stop
     * @returns {*}
     */
    lrange(name, start, stop) {
        return this.handle.wrap('lrange', [this.options.cache_key_prefix + name, start, stop]);
    }

    /**
     * 集合新增
     * @param name
     * @param value
     * @param timeout
     * @returns {*}
     */
    sadd(name, value, timeout = this.options.cache_timeout) {
        let setP = [this.handle.wrap('sadd', [this.options.cache_key_prefix + name, value])];
        if (typeof timeout === 'number') {
            setP.push(this.handle.wrap('expire', [this.options.cache_key_prefix + name, timeout]));
        }
        return Promise.all(setP);
    }

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */
    scard(name) {
        return this.handle.wrap('scard', [this.options.cache_key_prefix + name]);
    }

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */
    sismember(name, key) {
        return this.handle.wrap('sismember', [this.options.cache_key_prefix + name, key]);
    }

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */
    smembers(name) {
        return this.handle.wrap('smembers', [this.options.cache_key_prefix + name]);
    }

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */
    spop(name) {
        return this.handle.wrap('spop', [this.options.cache_key_prefix + name]);
    }

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */
    srem(name, key) {
        return this.handle.wrap('srem', [this.options.cache_key_prefix + name, key]);
    }
};