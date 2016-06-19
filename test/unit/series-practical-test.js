'use strict';

var expect = require('chai').expect;

describe('series - practical test', function() {
    var Series;
    var functionSeries = [];
    var initialA;
    var initialB;
    var numTimesToAdd;
    var numToAddEachTime;

    before('set up input', function () {
        Series = require('../../lib/series.js');
        initialA = 2;
        initialB = 0;
        numTimesToAdd = 10;
        numToAddEachTime = 5;

        functionSeries.push(add.bind(null, initialA, initialB));
        for (var i = 0; i < numTimesToAdd; ++i) {
            functionSeries.push(add);
        }
    });

    it('should execute all the functions provided and call the callback', function (done) {
        Series.series(functionSeries, function (error, result) {
            expect(result).to.equal(numToAddEachTime * numTimesToAdd + (initialA + initialB));
            done();
        });
    });

    function add(a, b, callback) {
        callback(null, a + b, numToAddEachTime);
    }
});

