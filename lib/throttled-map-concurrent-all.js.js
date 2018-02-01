'use strict';

module.exports = {
    throttledMapConcurrentAll(items, iteratee, numWorkers, allFunctionsCalled) {

        if (typeof (numWorkers) === 'function') {
            allFunctionsCalled = numWorkers;
            numWorkers = Math.floor(items.length / 2);
        }

        if (items.length === 0) { return allFunctionsCalled(null, []); }

        const actualNumWorkers = items.length < numWorkers ? items.length : numWorkers;

        const state = {
            itemsToProcess: items,
            results: [],
            indexToProcess: 0,
            numComplete: 0,
            numErrors: 0
        };

        function worker() {

            if (state.numComplete === state.itemsToProcess.length) { return; }

            if (state.indexToProcess >= state.itemsToProcess.length) { return; }

            const indexToProcess = state.indexToProcess;
            const itemToProcess = state.itemsToProcess[indexToProcess];
            const resultPosition = indexToProcess;

            ++state.indexToProcess;

            iteratee(itemToProcess, function(error, result) {
                if (error) ++state.numErrors;
                state.results[resultPosition] = {
                    error: error,
                    result: error ? null : result
                };
                ++state.numComplete;

                if (state.numComplete === state.itemsToProcess.length) {
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
