'use strict';

module.exports = {
    series: require('./lib/series.js').series,
    mapEach: require('./lib/map-each.js').mapEach,
    concurrent: require('./lib/concurrent.js').concurrent,
    concurrentAll: require('./lib/concurrent-all.js').concurrentAll,
    mapConcurrent: require('./lib/map-concurrent.js').mapConcurrent,
    mapConcurrentAll: require('./lib/map-concurrent-all.js').mapConcurrentAll,
    throttledConcurrentAll: require('./lib/throttled-concurrent-all.js').throttledConcurrentAll
};
