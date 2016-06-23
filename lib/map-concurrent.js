'use strict';

var MapConcurrent;
module.exports = MapConcurrent = {
    mapConcurrent: function(items, iteratee, callback) {
        var state = {
            numToDo: items.length,
            numComplete: 0,
            results: []
        };
        items.forEach(function(item, index) {
            var commonCallback = MapConcurrent._mapConcurrentCallback.bind(state, index, callback);
            process.nextTick(iteratee.bind(null, item, commonCallback));
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
