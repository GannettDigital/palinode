'use strict';

const concurrent = require('./concurrent.js').concurrent;

module.exports = {
    mapConcurrent: function(items, iteratee, callback) {
        const toRun = items.map((item) => iteratee.bind(null, item));
        concurrent(toRun, callback);
    }
};
