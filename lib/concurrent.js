'use strict';

module.exports = {
    concurrent(functions, callback) {
        if (functions.length === 0) {
            return callback(null, []);
        }

        const doConcurrently = (fn, index, state, done) => {
            if (state.error) return;

            fn((error, result) => {
                if (error) {
                    state.error = error;
                    return done(error);
                }

                state.results[index] = result;
                state.numComplete++;
                if (state.numComplete === state.numToDo) {
                    return done(null, state.results);
                }
            });
        };

        const initialState = {
            numToDo: functions.length,
            numComplete: 0,
            results: [],
            error: null
        };

        functions.forEach((fn, index) => {
            process.nextTick(() => doConcurrently(fn, index, initialState, callback));
        });
    }
};
