'use strict';

module.exports = {
    series: require('./lib/series.js').series,
    mapEach: require('./lib/map-each.js').mapEach,
    mapConcurrent: require('./lib/map-concurrent.js').mapConcurrent
};