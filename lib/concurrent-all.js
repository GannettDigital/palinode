'use strict';
var invokeConcurrently = require('./invoke-concurrently.js');

var ConcurrentAll;
module.exports = ConcurrentAll = {
    concurrentAll: function(functions, callback) {
        invokeConcurrently(functions, ConcurrentAll._concurrentAllCallback, callback);
    },
    _concurrentAllCallback: function(currentIndex, allDone, error, result) {
        if (error) {
            this.numErrors = this.numErrors ? 1 : this.numErrors++;
        }

        this.results[currentIndex] = {
            error: error || null,
            result: error ? null : result
        };

        this.numComplete++;

        if (this.numComplete === this.numToDo) {
            return process.nextTick(allDone.bind(null, this.numErrors === 0 ? null : this.numErrors, this.results));
        }
    }
};