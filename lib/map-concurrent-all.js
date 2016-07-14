'use strict';
var concurrentAll = require('./concurrent-all.js').concurrentAll;

module.exports = {
    mapConcurrentAll: function(items, iteratee, callback) {

        var toRun = items.map(function(item) {
            return iteratee.bind(null, item);
        });

        concurrentAll(toRun, callback);
    }
};
