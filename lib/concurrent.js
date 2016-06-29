'use strict';

var Concurrent;
module.exports = Concurrent = {
    concurrent: function(functions, callback) {
        if(functions.length === 0) {
            process.nextTick(callback.bind(null, null, []));
        }

        var state = {
            numToDo: functions.length,
            numComplete: 0,
            results: []
        };

        functions.forEach(function(fn, index) {
            var commonCallback = Concurrent._concurrentCallback.bind(state, index, callback);
            process.nextTick(fn.bind(null, commonCallback));
        });
    },
    _concurrentCallback: function(currentIndex, allDone, error, result) {
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
