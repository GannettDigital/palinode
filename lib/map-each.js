'use strict';

var MapEach;
module.exports = MapEach = {

    mapEach: function(inputArray, forEachMethod, callback) {
        var mapEachCallback = MapEach._mapEachCallback.bind(null, callback, inputArray, forEachMethod, 0, []);
        process.nextTick(forEachMethod.bind(null, inputArray[0], mapEachCallback));
    },
    _mapEachCallback: function(allDone, inputArray, forEachMethod, index, results, error, result) {
        if(error) {
            return process.nextTick(allDone.bind(null, error));
        }

        if(index === inputArray.length) {
            return process.nextTick(allDone.bind(null, null, results));
        }

        results.push(result);
        ++index;
        var mapEachCallback = MapEach._mapEachCallback.bind(null, allDone, inputArray, forEachMethod, index, results);
        process.nextTick(forEachMethod.bind(null, inputArray[index], mapEachCallback));
    }
};