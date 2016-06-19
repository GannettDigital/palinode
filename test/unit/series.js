'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('series', function() {

    var Series;
    var function0;
    var function1;
    var inputFunctions;
    var nextTickStub;

    before(function () {
        Series = require('../../lib/series.js');
        nextTickStub = sinon.stub(process, 'nextTick');
    });

    beforeEach(function () {
        nextTickStub.reset();
    });

    after(function () {
        process.nextTick.restore();
    });

    describe('series - entry point', function () {
        var seriesCallbackStub;
        var seriesCallbackBindStub;
        var seriesCallbackBindResult = {whatever: 'was the bind result'};
        var function0BindResult = {whatever: 'was the bind result function0'}
        var function0BindStub;
        var function1BindStub;

        before(function () {
            seriesCallbackStub = sinon.stub(Series, '_seriesCallback');
            seriesCallbackStub.bind = seriesCallbackBindStub = sinon.stub();
        });

        beforeEach(function () {
            seriesCallbackStub.reset();
            seriesCallbackStub.bind = seriesCallbackBindStub = sinon.stub();
            seriesCallbackBindStub.returns(seriesCallbackBindResult);
            inputFunctions = [function0 = sinon.spy(), function1 = sinon.spy()];
            function0.bind = function0BindStub = sinon.stub();
            function0BindStub.returns(function0BindResult);

            function1.bind = function1BindStub = sinon.stub();
        });

        after(function () {
            Series._seriesCallback.restore();
        });

        it('should not invoke the second function passed to the series', function () {
            Series.series(inputFunctions, sinon.spy());
            expect(function1.callCount).to.equal(0);
        });

        it('should not bind anything to the second function passed to the series', function () {
            Series.series(inputFunctions, sinon.spy());
            expect(function1BindStub.callCount).to.equal(0);
        });

        it('should bind the provided callback, funciton array and 1 to Series._seriesCallback', function () {
            var callbackSpy = sinon.spy();
            Series.series(inputFunctions, callbackSpy);
            expect(seriesCallbackBindStub.args[0]).to.eql([
                null, callbackSpy, inputFunctions, 1
            ]);
        });

        it('should bind the bound seriesCallback to the first function', function () {
            Series.series(inputFunctions, sinon.spy());
            expect(function0BindStub.args[0]).to.eql([
                null, seriesCallbackBindResult
            ]);
        });

        it('should invoke process.nextTick with the bound function0', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(nextTickStub.args[0]).to.eql([function0BindResult]);
        });

        it('should invoke process.nextTick once', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(nextTickStub.callCount).to.equal(1);
        });
    });

    describe('series - callback wrapper', function () {
        var allDone;
        var seriesCallbackBindStub;
        var applyBindStub;

        before(function () {
            seriesCallbackBindStub = sinon.stub(Series._seriesCallback, 'bind');
            applyBindStub = sinon.stub(Function.prototype.apply, 'bind');
        });

        beforeEach(function () {
            allDone = sinon.spy();
            inputFunctions = [function0 = sinon.spy(), function1 = sinon.spy()];
            seriesCallbackBindStub.reset();
            applyBindStub.reset();
        });

        after(function () {
            Series._seriesCallback.bind.restore();
            Function.prototype.apply.bind.restore();
        });

        it('should call the allDone callback if an error is passed', function () {
            var expectedError = new Error('whatever');
            Series._seriesCallback(allDone, inputFunctions, 1, expectedError);
            expect(allDone.args[0]).to.eql([expectedError]);
        });

        it('should call the allDone callback once if an error is passed', function () {
            var expectedError = new Error('whatever');
            Series._seriesCallback(allDone, inputFunctions, 1, expectedError);
            expect(allDone.callCount).to.equal(1);
        });

        it('should invoke the allDone callback when the length of the input functions array equals the index', function () {
            Series._seriesCallback(allDone, inputFunctions, 2, null);
            expect(allDone.args[0]).to.eql([null]);
        });

        it('should invoke the allDone callback once when the length of the input functions array equals the index', function () {
            Series._seriesCallback(allDone, inputFunctions, 2, null);
            expect(allDone.callCount).to.equal(1);
        });

        it('should invoke the allDone callback with a spread of any additional arguments', function () {
            var arg1 = {iAm: 'an object'};
            var arg2 = 'stringy string';
            var arg3 = 999999999;

            Series._seriesCallback(allDone, inputFunctions, 2, null, arg1, arg2, arg3);
            expect(allDone.args[0]).to.eql([null, arg1, arg2, arg3]);
        });

        it('should create a callback by binding the allDone callback, input functions and incremented index to itself', function () {
            Series._seriesCallback(allDone, inputFunctions, 1, null);

            expect(seriesCallbackBindStub.args[0]).to.eql([
                null, allDone, inputFunctions, 2
            ]);
        });

        it('should bind null, the provided arguments, and the freshly created _seriesCallback to the next input functions apply method', function () {
            var arg1 = {iAm: 'an object'};
            var arg2 = 'stringy string';
            var arg3 = 999999999;
            var seriesCallback = function recursive_seriesCallback() {
            };
            seriesCallbackBindStub.returns(seriesCallback);

            Series._seriesCallback(allDone, inputFunctions, 1, null, arg1, arg2, arg3);
            expect(applyBindStub.args[0]).eql([
                function1, null, [arg1, arg2, arg3, seriesCallback]
            ]);
        });

        it('should call process.nextTick with the function created by binding parameters to the second function', function () {
            var seriesCallback = function recursive_seriesCallback() {
            };
            var fakeNext = function next() {
            };
            seriesCallbackBindStub.returns(seriesCallback);
            applyBindStub.returns(fakeNext);

            Series._seriesCallback(allDone, inputFunctions, 1, null);
            expect(nextTickStub.args[0]).eql([
                fakeNext
            ]);
        });

        it('should call process.nextTick once', function () {
            var seriesCallback = function recursive_seriesCallback() {
            };
            var fakeNext = function next() {
            };
            seriesCallbackBindStub.returns(seriesCallback);
            applyBindStub.returns(fakeNext);

            Series._seriesCallback(allDone, inputFunctions, 1, null);
            expect(nextTickStub.callCount).to.equal(1);
        });
    });
});