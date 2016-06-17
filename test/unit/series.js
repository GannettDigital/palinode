'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('series', function() {

    var functionSeries = [];
    var series = require('../../lib/series.js').series;
    var initialA;
    var initialB;
    var numTimesToAdd;
    var numToAddEachTime;

    before('set up input', function() {
        initialA = 2;
        initialB = 0;
        numTimesToAdd = 10;
        numToAddEachTime = 5;
        functionSeries.push(add.bind(null, initialA, initialB));
        for (var i = 0; i < 10; ++i) {
            functionSeries.push(add);
        }

    });

    it('should execute all the functions provided and call the callback', function(done) {
        series(functionSeries, function(error, result) {
            expect(result).to.equal(numToAddEachTime * numTimesToAdd + (initialA + initialB));
            done();
        });
    });

    function add(a, b, callback) {
        if (a < 0) {
            callback(new Error('a cannot be less than zero'));
        }

        callback(null, a + b, numToAddEachTime);
    }
});
