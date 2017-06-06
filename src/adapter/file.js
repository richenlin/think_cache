/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/6/6
 */
const fs = require('fs');
const lib = require('think_lib');
const base = require('../base.js');
var _cachesGC = {};

module.exports = class extends base {
    constructor(options = {}) {
        super(options);
        this.cachePath = `${this.options.cache_path}${lib.sep}${this.options.cache_key_prefix}${lib.sep}Cache`;
        this.options.gctype = 'fileCache';
        const gcTimer = instance => {
            if (_cachesGC[instance.options.gctype]) {
                return;
            }
            _cachesGC[instance.options.gctype] = setInterval(() => {
                let hour = new Date().getHours();
                if ((this.options.cache_gc_hour).indexOf(hour) === -1) {
                    return null;
                }
                return instance.gc && instance.gc(Date.now());
            }, 3600 * 1000);
        };
        gcTimer(this);
    }

    getFilePath(name) {
        let tmp = lib.md5(name).split('').slice(0, 1) || '';
        let dir = `${this.cachePath}${lib.sep}${tmp}`;
        lib.isDir(dir) || lib.mkDir(dir);
        return `${dir}${lib.sep}${name}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name) {
        let file = this.getFilePath(name);
        if (!lib.isFile(file)) {
            return Promise.resolve('');
        }
        let fn = lib.promisify(fs.readFile, fs);
        return fn(file, { encoding: 'utf8' }).then(data => {
            if (!data) {
                return '';
            }
            try {
                data = JSON.parse(data);
                if (Date.now() > (data.expire || 0)) {
                    fs.unlink(file, function () {
                    });
                    return '';
                } else {
                    return data.data;
                }
            } catch (e) {
                fs.unlink(file, function () {
                });
                return '';
            }
        }).catch(() => '');
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout) {
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        let file = this.getFilePath(name);
        let data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        let fn = lib.promisify(fs.writeFile, fs);
        return fn(file, JSON.stringify(data)).then(() => {
            //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
            lib.chmod(file);
        });
    }

    /**
     *
     * @param name
     */
    rm(name) {
        let file = this.getFilePath(name);
        if (lib.isFile(file)) {
            let fn = lib.promisify(fs.unlink, fs);
            return fn(file);
        }
        return Promise.resolve();
    }

    /**
     *
     * @param now
     * @param path
     */
    gc(now = Date.now(), path) {
        //缓存回收
        path = path || this.cachePath;
        let files = fs.readdirSync(path);
        files.forEach(item => {
            let file = path + lib.sep + item;
            if (lib.isDir(file)) {
                this.gc(now, file);
            } else {
                let data = '';
                if (fs.existsSync(file)){
                    data = fs.readFileSync(file, 'utf8');
                }
                try {
                    data = JSON.parse(data);
                    if (now > data.expire) {
                        fs.unlink(file, function () { });
                    }
                } catch (e) {
                    lib.log(e);
                }
            }
        });
    }
};