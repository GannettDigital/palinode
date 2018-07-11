'use strict';

const concurrentAll = require('./concurrent-all.js').concurrentAll;

module.exports = {
    mapConcurrentAll(items, iteratee, callback) {
        const toRun = items.map((item) => iteratee.bind(null, item));
        concurrentAll(toRun, callback);
    }
};
