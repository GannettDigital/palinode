'use strict';

module.exports = {

    mapEach: (inputArray, forEachMethod, callback) => {
        if (inputArray.length === 0) {
            return callback(null, []);
        }

        const doMap = (fn, index, accumulator, terminateOnIndex, done) => {

            fn(inputArray[index], (error, result) => {
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

        doMap(forEachMethod, 0, [], inputArray.length, callback);
    }
};
