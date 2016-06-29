'use strict';
var concurrent = require('./concurrent.js').concurrent;

var MapConcurrent;
module.exports = MapConcurrent = {
    mapConcurrent: function(items, iteratee, callback) {

        var toRun = items.map(function(item) {
            return iteratee.bind(null, item);
        });

        concurrent(toRun, callback);
    }
};
