'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

describe('series', function() {

    let Series;
    let function0;
    let function1;
    let inputFunctions;
    let nextTickStub;

    before(function() {
        Series = require('../../lib/series.js');
        nextTickStub = sinon.stub(process, 'nextTick');
    });

    beforeEach(function() {
        nextTickStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('series - entry point', function() {
        let seriesCallbackStub;
        let seriesCallbackBindStub;
        const seriesCallbackBindResult = function seriesCallbackBindResult() {};
        const function0BindResult = function function0BindResult() {};
        let function0BindStub;
        let function1BindStub;

        before(function() {
            seriesCallbackStub = sinon.stub(Series, '_seriesCallback');
        });

        beforeEach(function() {
            seriesCallbackStub.reset();
            seriesCallbackStub.bind = seriesCallbackBindStub = sinon.stub();
            seriesCallbackBindStub.returns(seriesCallbackBindResult);
            inputFunctions = [function0 = sinon.spy(), function1 = sinon.spy()];
            function0.bind = function0BindStub = sinon.stub();
            function0BindStub.returns(function0BindResult);

            function1.bind = function1BindStub = sinon.stub();
        });

        after(function() {
            Series._seriesCallback.restore();
        });

        it('should not invoke the second function passed to the series', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(function1.callCount).to.equal(0);
        });

        it('should not bind anything to the second function passed to the series', function() {
            Series.series(inputFunctions, sinon.spy());
            expect(function1BindStub.callCount).to.equal(0);
        });

        it('should bind the provided callback, function array and 1 to Series._seriesCallback', function() {
            const callbackSpy = sinon.spy();
            Series.series(inputFunctions, callbackSpy);
            expect(seriesCallbackBindStub.args[0]).to.eql([
                null, callbackSpy, inputFunctions, 1
            ]);
        });

        it('should bind the bound seriesCallback to the first function', function() {
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

    describe('series - callback wrapper', function() {
        let allDoneSpy;
        let allDoneBindStub;
        const allDoneBindResult = {result: 'of allDone.bind'};

        let seriesCallbackBindStub;
        let applyBindStub;

        before(function() {
            seriesCallbackBindStub = sinon.stub(Series._seriesCallback, 'bind');
            applyBindStub = sinon.stub(Function.prototype.apply, 'bind');
        });

        beforeEach(function() {
            allDoneSpy = sinon.spy();
            allDoneSpy.bind = allDoneBindStub = sinon.stub().returns(allDoneBindResult);

            inputFunctions = [function0 = sinon.spy(), function1 = sinon.spy()];
            seriesCallbackBindStub.reset();
            applyBindStub.reset();
        });

        after(function() {
            Series._seriesCallback.bind.restore();
            Function.prototype.apply.bind.restore();
        });

        describe('invoked with error', function() {
            let expectedError;
            beforeEach(function() {
                expectedError = new Error('whatever');
                Series._seriesCallback(allDoneSpy, inputFunctions, 1, expectedError);
            });

            it('should bind null and the error to the allDone callback if an error is passed', function() {
                expect(allDoneBindStub.args[0]).to.eql([null, expectedError]);
            });

            it('should invoke process.nextTick with the bound allDone if an error is passed', function() {
                expect(nextTickStub.args[0]).to.eql([allDoneBindResult]);
            });

            it('should invoke process.nextTick once if an error is passed', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });

        describe('final invocation, no errors', function() {
            let arg1, arg2, arg3;
            const applyBindStubResult = {there: 'was a fire fight!!!'};

            beforeEach(function() {
                arg1 = {iAm: 'an object'};
                arg2 = 'stringy string';
                arg3 = 999999999;
                applyBindStub.returns(applyBindStubResult);
                Series._seriesCallback(allDoneSpy, inputFunctions, 2, null, arg1, arg2, arg3);
            });

            it('should bind the results such that null is in the first position to indicate no error', function() {
                const bindStubArgs = applyBindStub.args[0];
                const bindStubResultsArgs = bindStubArgs[2];
                expect(bindStubResultsArgs[0]).to.eql(null);
            });

            it('should bind the null, and results to the allDone.apply method', function() {
                expect(applyBindStub.args[0]).to.eql([
                    allDoneSpy, null, [null, arg1, arg2, arg3]
                ]);
            });

            it('should invoke process.nextTick with the result of the apply.bind', function() {
                expect(nextTickStub.args[0]).to.eql([applyBindStubResult]);
            });

            it('should invoke process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });

        describe('continuing invocations', function() {
            let arg1, arg2, arg3;
            let seriesCallbackBindResult;
            let fakeNext;

            beforeEach(function() {
                arg1 = {iAm: 'an object'};
                arg2 = 'stringy string';
                arg3 = 999999999;

                seriesCallbackBindResult = function recursive_seriesCallback() {};
                seriesCallbackBindStub.returns(seriesCallbackBindResult);

                fakeNext = function next() {
                };
                seriesCallbackBindStub.returns(seriesCallbackBindResult);
                applyBindStub.returns(fakeNext);

                Series._seriesCallback(allDoneSpy, inputFunctions, 1, null, arg1, arg2, arg3);
            });

            it('should bind null, the provided arguments, and the freshly created _seriesCallback to the next input functions apply method', function() {
                expect(applyBindStub.args[0]).eql([
                    function1, null, [arg1, arg2, arg3, seriesCallbackBindResult]
                ]);
            });

            it('should call process.nextTick with the function created by binding parameters to the second function', function() {
                expect(nextTickStub.args[0]).eql([fakeNext]);
            });

            it('should call process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });
    });
});
