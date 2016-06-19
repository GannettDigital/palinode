'use strict';

var Series;
module.exports = Series = {

    series: function(functions, callback) {
        var seriesCallback = Series._seriesCallback.bind(null, callback, functions, 1);
        process.nextTick(functions[0].bind(null, seriesCallback));
    },

    _seriesCallback: function(allDone, functions, index, error) {
        var slicedArgs = Array.prototype.slice.call(arguments);
        var results = slicedArgs.slice(4);

        if (error) return process.nextTick(allDone.bind(null, error));

        if (functions.length === index) {
            results.unshift(null);
            var done = Function.prototype.apply.bind(allDone, null, results);
            process.nextTick(done);
            return;
        }

        var unboundNext = functions[index];
        var seriesCallback = Series._seriesCallback.bind(null, allDone, functions, index + 1);
        results.push(seriesCallback);

        var next = Function.prototype.apply.bind(unboundNext, null, results);

        process.nextTick(next);
    }
};
