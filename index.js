'use strict';

module.exports = {
    series: require('./lib/series.js').series,
    mapEach: require('./lib/map-each.js').mapEach,
    concurrent: require('./lib/concurrent.js').concurrent,
    mapConcurrent: require('./lib/map-concurrent.js').mapConcurrent
};
