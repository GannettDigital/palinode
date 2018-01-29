'use strict';

module.exports = {
    throttledConcurrentAll(functionsToRun, numWorkers, allFunctionsCalled) {

        if (functionsToRun.length === 0) { return allFunctionsCalled(null, []); }

        const actualNumWorkers = functionsToRun.length < numWorkers ? functionsToRun.length : numWorkers;

        const state = {
            functionsToRun: functionsToRun,
            results: [],
            indexToProcess: 0,
            numComplete: 0,
            numErrors: 0
        };

        function worker() {

            if (state.numComplete === state.functionsToRun.length) { return; }

            if (state.indexToProcess >= state.functionsToRun.length) { return; }

            const indexToProcess = state.indexToProcess;
            const toDo = state.functionsToRun[indexToProcess];
            const resultPosition = indexToProcess;

            ++state.indexToProcess;

            toDo(function(error, result) {
                if (error) ++state.numErrors;
                state.results[resultPosition] = {
                    error: error,
                    result: error ? null : result
                };
                ++state.numComplete;

                if (state.numComplete === state.functionsToRun.length) {
                    allFunctionsCalled(state.numErrors, state.results);
                } else {
                    worker();
                }
            });
        }

        for (let x = 0; x < actualNumWorkers; ++x) {
            worker();
        }
    }
};
