'use strict';

module.exports = {

    mapEach: (items, forEachItem, callback) => {
        if (items.length === 0) {
            return callback(null, []);
        }

        const doMap = (fn, index, accumulator, terminateOnIndex, done) => {
            fn(items[index], (error, result) => {
                if (error) {
                    return done(error);
                }

                accumulator.push(result);
                ++index;

                if (index === terminateOnIndex) {
                    return done(null, accumulator);
                }

                process.nextTick(() => doMap(fn, index, accumulator, terminateOnIndex, done));
            });
        };

        doMap(forEachItem, 0, [], items.length, callback);
    }
};
