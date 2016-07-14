'use strict';

module.exports = function (functionsToRun, operationSpecificCallback, allDoneCallback) {
    if (functionsToRun.length === 0) {
        process.nextTick(allDoneCallback.bind(null, null, []));
        return;
    }

    var state = {
        numToDo: functionsToRun.length,
        numComplete: 0,
        results: []
    };

    functionsToRun.forEach(function (fn, index) {
        var commonCallback = operationSpecificCallback.bind(state, index, allDoneCallback);
        process.nextTick(fn.bind(null, commonCallback));
    });
}
