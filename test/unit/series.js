'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('series', function() {

    var Series;
    before(function() {
        Series = require('../../lib/series.js');
    });

    describe('series - entry point', function() {
        var seriesCallbackStub;
        var bindStub;
        var function1;
        var function2;
        var inputFunctions;
        var seriesCallbackBindResult = {whatever: 'was the bind result'};

        before(function() {
            seriesCallbackStub = sinon.stub(Series, '_seriesCallback');
            seriesCallbackStub.bind = bindStub = sinon.stub();
        });

        beforeEach(function() {
            seriesCallbackStub.reset();
            seriesCallbackStub.bind = bindStub = sinon.stub();
            bindStub.returns(seriesCallbackBindResult);
            inputFunctions = [function1 = sinon.spy(), function2 = sinon.spy()];
        });

        after(function() {
            Series._seriesCallback.restore();
        });

        it('should invoke the first function passed to the series once', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(function1.callCount).to.equal(1);
        });

        it('should not invoke the second function passed to the series', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(function2.callCount).to.equal(0);
        });

        it('should bind the provided callback, funciton array and 1 to Series._seriesCallback', function() {
            var callbackSpy = sinon.spy();
            Series.series(inputFunctions, callbackSpy);
            expect(bindStub.args[0]).to.eql([
                null, callbackSpy, inputFunctions, 1
            ]);
        });

        it('should invoke the first function with the result of the bound Series._seriesCallback', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(function1.args[0]).to.eql([seriesCallbackBindResult]);
        });
    });

    describe('series - practical test', function() {
        var functionSeries = [];
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
            for (var i = 0; i < numTimesToAdd; ++i) {
                functionSeries.push(add);
            }
        });

        it('should execute all the functions provided and call the callback', function(done) {
            Series.series(functionSeries, function(error, result) {
                expect(result).to.equal(numToAddEachTime * numTimesToAdd + (initialA + initialB));
                done();
            });
        });

        function add(a, b, callback) {
            callback(null, a + b, numToAddEachTime);
        }
    });
});
