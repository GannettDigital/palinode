'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

describe('series - practical test', function() {
    var Series;
    var functionSeries = [];
    var initialA;
    var initialB;
    var numTimesToAdd;
    var numToAddEachTime;

    var addSpy;
    function add(a, b, callback) {
        callback(null, a + b, numToAddEachTime);
    }

    before('set up input', function() {
        Series = require('../../lib/series.js');
        initialA = 2;
        initialB = 0;
        numTimesToAdd = 10;
        numToAddEachTime = 5;

        addSpy = sinon.spy(add);

        functionSeries.push(addSpy.bind(null, initialA, initialB));
        for (var i = 0; i < numTimesToAdd; ++i) {
            functionSeries.push(addSpy);
        }
    });

    var error;
    var result;
    beforeEach(function(done) {
        addSpy.reset();
        Series.series(functionSeries, function(err, res) {
            error = err;
            result = res;
            done();
        });
    });

    it('should execute all the functions provided and call the callback', function() {
        expect(result).to.equal(numToAddEachTime * numTimesToAdd + (initialA + initialB));
    });

    it('should invoke the each method in the series once', function() {
        expect(addSpy.callCount).to.equal(functionSeries.length);
    });
});

