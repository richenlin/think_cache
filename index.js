/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const lib = require('think_lib');

module.exports = function (options) {
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