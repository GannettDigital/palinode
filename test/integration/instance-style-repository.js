'use strict';

const os = require('os');

module.exports = class Repository {

    constructor() {
        this.data = {
            accessLog: {

            }
        };
    }

    upsert(key, value, callback) {
        this.data[key] = this._buildMetadata(value);
        setTimeout(callback, (Math.random() * 500) + 50);
    }

    get(key, callback) {
        if(!this.data[key]) {
            return setTimeout(() => callback(new Error(`key: ${key} not found`)), (Math.random() * 500) + 50);
        }
        setTimeout(() => {
            if(!this.data.accessLog[key]) {
                this.data.accessLog[key] = [];
            }

            this.data.accessLog.key.push(this._buildAccessLogEntry(key));

            setTimeout(() => callback(null, this.data[key]), (Math.random() * 500) + 50);
        }, 10);
    }

    _buildMetadata(value) {
        return {
            data: value,
            date: Date.now(),
            system: os.hostname,
            user: os.userInfo().username
        };
    }

    _buildAccessLogEntry(key) {
        return {
            key: key,
            date: Date.now(),
            system: os.hostname,
            user: os.userInfo().username
        };
    }
};
