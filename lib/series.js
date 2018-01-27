'use strict';

let Series;
module.exports = Series = {

    series: function(functions, callback) {
        const seriesCallback = Series._seriesCallback.bind(null, callback, functions, 1);
        process.nextTick(functions[0].bind(null, seriesCallback));
    },

    _seriesCallback: function(allDone, functions, index, error) {
        const slicedArgs = Array.prototype.slice.call(arguments);
        const results = slicedArgs.slice(4);

        if (error) return process.nextTick(allDone.bind(null, error));

        if (functions.length === index) {
            results.unshift(null);
            const done = Function.prototype.apply.bind(allDone, null, results);
            process.nextTick(done);
            return;
        }

        const unboundNext = functions[index];
        const seriesCallback = Series._seriesCallback.bind(null, allDone, functions, index + 1);
        results.push(seriesCallback);

        const next = Function.prototype.apply.bind(unboundNext, null, results);

        process.nextTick(next);
    }
};
