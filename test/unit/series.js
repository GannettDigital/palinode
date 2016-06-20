'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('series', function() {

    var Series;
    var function1;
    var function2;
    var inputFunctions;

    before(function() {
        Series = require('../../lib/series.js');
    });

    describe('series - entry point', function() {
        var seriesCallbackStub;
        var bindStub;
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

    describe('series - callback wrapper', function() {
        var allDone;
        var seriesCallbackBindStub;
        var applyBindStub;
        var nextTickStub;

        before(function() {
            seriesCallbackBindStub = sinon.stub(Series._seriesCallback, 'bind');
            applyBindStub = sinon.stub(Function.prototype.apply, 'bind');
            nextTickStub = sinon.stub(process, 'nextTick');
        });

        beforeEach(function() {
            allDone = sinon.spy();
            inputFunctions = [function1 = sinon.spy(), function2 = sinon.spy()];
            seriesCallbackBindStub.reset();
            applyBindStub.reset();
            nextTickStub.reset();
        });

        after(function() {
            Series._seriesCallback.bind.restore();
            Function.prototype.apply.bind.restore();
            process.nextTick.restore();
        });

        it('should call the allDone callback if an error is passed', function() {
            var expectedError = new Error('whatever');
            Series._seriesCallback(allDone, inputFunctions, 1, expectedError);
            expect(allDone.args[0]).to.eql([expectedError]);
        });

        it('should call the allDone callback once if an error is passed', function() {
            var expectedError = new Error('whatever');
            Series._seriesCallback(allDone, inputFunctions, 1, expectedError);
            expect(allDone.callCount).to.equal(1);
        });

        it('should invoke the allDone callback when the length of the input functions array equals the index', function() {
            Series._seriesCallback(allDone, inputFunctions, 2, null);
            expect(allDone.args[0]).to.eql([null]);
        });

        it('should invoke the allDone callback once when the length of the input functions array equals the index', function() {
            Series._seriesCallback(allDone, inputFunctions, 2, null);
            expect(allDone.callCount).to.equal(1);
        });

        it('should invoke the allDone callback with a spread of any additional arguments', function() {
            var arg1 = {iAm:'an object'};
            var arg2 = 'stringy string';
            var arg3 = 999999999;

            Series._seriesCallback(allDone, inputFunctions, 2, null, arg1, arg2, arg3);
            expect(allDone.args[0]).to.eql([null, arg1, arg2, arg3]);
        });

        it('should create a callback by binding the allDone callback, input functions and incremented index to itself', function() {
            Series._seriesCallback(allDone, inputFunctions, 1, null);

            expect(seriesCallbackBindStub.args[0]).to.eql([
                null, allDone, inputFunctions, 2
            ]);
        });

        it('should bind null, the provided arguments, and the freshly created _seriesCallback to the next input functions apply method', function() {
            var arg1 = {iAm:'an object'};
            var arg2 = 'stringy string';
            var arg3 = 999999999;
            var seriesCallback = function recursive_seriesCallback() {};
            seriesCallbackBindStub.returns(seriesCallback);

            Series._seriesCallback(allDone, inputFunctions, 1, null, arg1, arg2, arg3);
            expect(applyBindStub.args[0]).eql([
                function2, null, [arg1, arg2, arg3, seriesCallback]
            ]);
        });

        it('should call process.nextTick with the function created by binding parameters to the second function', function() {
            var seriesCallback = function recursive_seriesCallback() {};
            var fakeNext = function next() {};
            seriesCallbackBindStub.returns(seriesCallback);
            applyBindStub.returns(fakeNext);

            Series._seriesCallback(allDone, inputFunctions, 1, null);
            expect(nextTickStub.args[0]).eql([
                fakeNext
            ]);
        });

        it('should call process.nextTick once', function() {
            var seriesCallback = function recursive_seriesCallback() {};
            var fakeNext = function next() {};
            seriesCallbackBindStub.returns(seriesCallback);
            applyBindStub.returns(fakeNext);

            Series._seriesCallback(allDone, inputFunctions, 1, null);
            expect(nextTickStub.callCount).to.equal(1);
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
