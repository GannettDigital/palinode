
var Series;
module.exports = Series = {

    series: function(functions, callback) {
        functions[0](Series._seriesCallback.bind(null, callback, functions, 1));
    },

    _seriesCallback: function(allDone, functions, index, error) {
        var slicedArgs = Array.prototype.slice.call(arguments);
        var results = slicedArgs.slice(4);

        if (error) return allDone(error);

        if (functions.length === index) {
            results.unshift(null);
            allDone.apply(null, results);
            return;
        }

        var unboundNext = functions[index];
        var seriesCallback = Series._seriesCallback.bind(null, allDone, functions, index + 1);
        results.push(seriesCallback);

        var next = Function.prototype.apply.bind(unboundNext, null, results);

        process.nextTick(next);
    }
};
