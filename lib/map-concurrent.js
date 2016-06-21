'use strict';

var MapConcurrent;
module.exports = MapConcurrent = {
    mapConcurrent: function(functions, callback) {
        var state = {
            numToDo: functions.length,
            numComplete: 0,
            results: []
        };
        functions.forEach(function(fn, index) {
            var commonCallback = MapConcurrent._mapConcurrentCallback.bind(state, index, callback);
            process.nextTick(fn.bind(null, commonCallback));
        });
    },
    _mapConcurrentCallback: function(currentIndex, allDone, error, result) {
        if (this.error) return;
        if (error) {
            this.error = error;
            return process.nextTick(allDone.bind(null, error));
        }

        this.results[currentIndex] = result;
        this.numComplete++;
        if (this.numComplete === this.numToDo) {
            return process.nextTick(allDone.bind(null, null, this.results));
        }
    }
};
