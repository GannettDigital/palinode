'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

describe('series - practical test', function() {
    let Series;
    const functionSeries = [];
    let initialA;
    let initialB;
    let numTimesToAdd;
    let numToAddEachTime;

    let addSpy;
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
        for (let i = 0; i < numTimesToAdd; ++i) {
            functionSeries.push(addSpy);
        }
    });

    let error;
    let result;
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

