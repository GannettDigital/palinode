'use strict';

module.exports = {
    concurrentAll: (functions, callback) => {
        if (functions.length === 0) {
            return callback(null, []);
        }

        const doConcurrently = (fn, index, state, done) => {
            fn((error, result) => {
                if (error) {
                    state.numErrors = state.numErrors ? state.numErrors + 1 : 1;
                }

                state.results[index] = {
                    error: error || null,
                    result: error ? null : result
                };

                ++state.numComplete;

                if (state.numComplete === state.numToDo) {
                    return done(state.numErrors || null, state.results);
                }
            });
        };

        const initialState = {
            numToDo: functions.length,
            numErrors: null,
            numComplete: 0,
            results: [],
            error: null
        };

        functions.forEach((fn, index) => {
            process.nextTick(() => doConcurrently(fn, index, initialState, callback));
        });
    }
};
