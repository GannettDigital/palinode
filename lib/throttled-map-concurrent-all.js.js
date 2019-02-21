'use strict';

module.exports = {
    throttledMapConcurrentAll(items, iteratee, numWorkers, callback) {

        if(typeof (numWorkers) === 'function') {
            callback = numWorkers;
            numWorkers = Math.ceil(items.length / 2);
        }

        if(items.length === 0) { return callback(null, []); }

        const actualNumWorkers = items.length < numWorkers ? items.length : numWorkers;

        function concurrentWorker(state, done) {

            if(state.numComplete === state.itemsToProcess.length) { return; }

            if(state.indexToProcess >= state.itemsToProcess.length) { return; }

            const indexToProcess = state.indexToProcess;
            const itemToProcess = state.itemsToProcess[indexToProcess];
            const resultPosition = indexToProcess;

            ++state.indexToProcess;

            iteratee(itemToProcess, function(error, result) {
                if(error) ++state.numErrors;

                state.results[resultPosition] = {
                    error: error || null,
                    result: error ? null : result
                };

                ++state.numComplete;

                if(state.numComplete === state.itemsToProcess.length) {
                    return done(state.numErrors || null, state.results);
                }

                process.nextTick(() => concurrentWorker(state, done));
            });
        }

        const state = {
            itemsToProcess: items,
            iteratee: iteratee,
            results: [],
            indexToProcess: 0,
            numComplete: 0,
            numErrors: 0
        };

        for (let x = 0; x < actualNumWorkers; ++x) {
            concurrentWorker(state, callback);
        }
    }
};
