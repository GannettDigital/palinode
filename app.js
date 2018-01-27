'use strict';

var throttledConcurrentAll = require('./index.js').throttledConcurrentAll;

var numWorkers = 10;
var numFunctions = 100;

function doIt(index, callback) {
    var timeout = Math.random() * 1000;
    setTimeout(function() {
        callback(null, {index: index,  sleptFor: timeout});
    }, timeout)
}

var functionsToRun = [];
for(var x = 0; x < numFunctions; ++x) {
    functionsToRun.push(doIt.bind(null, x));
}

var start = Date.now();

throttledConcurrentAll(functionsToRun, numWorkers, function(error, results) {
    var output = {
        numTasks: functionsToRun.length,
        numWorkers: numWorkers,
        processingTime: results
            .map(function(r) { return r.result.sleptFor;})
            .reduce(function(memo, t){return memo += t;}, 0),
        actualTime: Date.now() - start
    };
    console.log(JSON.stringify(output, null, 2));
});


