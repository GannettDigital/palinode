'use strict';

const os = require('os');

module.exports = class Repository {

    constructor() {
        this.data = {};
    }

    set(key, value, callback) {
        this.data[key] = this._buildMetadata(value);
        setTimeout(callback, (Math.random() * 500) + 50);
    }

    get(key, callback) {
        if(!this.data[key]) {
            return setTimeout(() => callback(new Error(`key: ${key} not found`)), (Math.random() * 500) + 50);
        }
        setTimeout(() => callback(null, this.data[key]), (Math.random() * 500) + 50);
    }

    _buildMetadata(value) {
        return {
            data: value,
            date: Date.now(),
            system: os.hostname,
            user: os.userInfo().username
        };
    }
};
