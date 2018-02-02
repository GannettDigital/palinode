'use strict';

let MapEach;
module.exports = MapEach = {

    mapEach: function(inputArray, forEachMethod, callback) {

        if (inputArray.length === 0) {
            process.nextTick(callback.bind(null, null, []));
            return;
        }

        const mapEachCallback = MapEach._mapEachCallback.bind(null, callback, inputArray, forEachMethod, 0, []);
        process.nextTick(forEachMethod.bind(null, inputArray[0], mapEachCallback));
    },
    _mapEachCallback: function(allDone, inputArray, forEachMethod, index, results, error, result) {
        if (error) {
            return process.nextTick(allDone.bind(null, error));
        }

        results.push(result);
        ++index;

        if (index === inputArray.length) {
            return process.nextTick(allDone.bind(null, null, results));
        }

        const mapEachCallback = MapEach._mapEachCallback.bind(null, allDone, inputArray, forEachMethod, index, results);
        process.nextTick(forEachMethod.bind(null, inputArray[index], mapEachCallback));
    }
};
