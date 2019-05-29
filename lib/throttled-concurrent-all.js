'use strict';

module.exports = {
    throttledConcurrentAll(functionsToRun, numWorkers, callback) {

        if(typeof (numWorkers) === 'function') {
            callback = numWorkers;
            numWorkers = Math.ceil(functionsToRun.length / 2);
        }

        if(functionsToRun.length === 0) { return callback(null, []); }

        const actualNumWorkers = functionsToRun.length < numWorkers ? functionsToRun.length : numWorkers;

        const concurrentWorker = (state, done) => {

            if(state.numComplete === state.functionsToRun.length) { return; }

            if(state.indexToProcess >= state.functionsToRun.length) { return; }

            const indexToProcess = state.indexToProcess;
            const toDo = state.functionsToRun[indexToProcess];
            const resultPosition = indexToProcess;

            ++state.indexToProcess;

            toDo(function(error, result) {
                if(error) ++state.numErrors;

                state.results[resultPosition] = {
                    error: error || null,
                    result: error ? null : result
                };

                ++state.numComplete;

                if(state.numComplete === state.functionsToRun.length) {
                    return done(state.numErrors || null, state.results);
                }

                process.nextTick(() => concurrentWorker(state, done));
            });
        };

        const initialState = {
            functionsToRun: functionsToRun,
            results: [],
            indexToProcess: 0,
            numComplete: 0,
            numErrors: 0
        };

        for (let x = 0; x < actualNumWorkers; ++x) {
            process.nextTick(() => concurrentWorker(initialState, callback));
        }
    }
};
