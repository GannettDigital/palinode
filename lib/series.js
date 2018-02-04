'use strict';

let Series;
module.exports = Series = {

    series(functions, callback) {
        const seriesCallback = Series._seriesCallback.bind(null, callback, functions, 1);
        process.nextTick(functions[0].bind(null, seriesCallback));
    },

    _seriesCallback(done, functions, index, error) {
        if (error) return done(error);

        const slicedArgs = Array.prototype.slice.call(arguments);
        const results = slicedArgs.slice(4);

        if (functions.length === index) {
            results.unshift(null);
            return process.nextTick(Function.prototype.apply.bind(done, null, results));
        }

        const unboundNext = functions[index];
        const seriesCallback = Series._seriesCallback.bind(null, done, functions, index + 1);
        results.push(seriesCallback);

        process.nextTick(Function.prototype.apply.bind(unboundNext, null, results));
    }
};
