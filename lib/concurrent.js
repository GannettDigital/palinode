'use strict';
var invokeConcurrently = require('./invoke-concurrently.js');

var Concurrent;
module.exports = Concurrent = {
    concurrent: function(functions, callback) {
        invokeConcurrently(functions, Concurrent._concurrentCallback, callback);
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
