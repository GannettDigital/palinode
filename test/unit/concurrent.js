'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('concurrent - unit tests', function() {
    var Concurrent;
    var nextTickStub;
    var callbackSpy;
    var callbackSpyBindStub;
    var boundCallbackSpy = function boundCallbackSpy() {};

    before(function() {
        nextTickStub = sinon.stub(process, 'nextTick');
        callbackSpy = sinon.spy();
        callbackSpy.bind = callbackSpyBindStub = sinon.stub().returns(boundCallbackSpy);
    });

    beforeEach(function() {
        nextTickStub.reset();
        callbackSpy.reset();
        callbackSpyBindStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('concurrent - entry point', function() {
        var invokeConcurrentlySpy;
        var inputFunctions = [function one(){}, function two(){}];

        before(function() {
            mockery.enable({
                useCleanCache: true
            });
            mockery.registerAllowable('../../lib/concurrent.js');
            mockery.registerMock('./invoke-concurrently.js', invokeConcurrentlySpy = sinon.spy());
            Concurrent = require('../../lib/concurrent.js');
        });

        beforeEach(function() {
            invokeConcurrentlySpy.reset();
            Concurrent.concurrent(inputFunctions, callbackSpy);
        });

        after(function(){
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call invokeConcurrently with the inputFunctions, _concurrentCallback and callback', function() {
            expect(invokeConcurrentlySpy.args[0]).to.eql([
                inputFunctions, Concurrent._concurrentCallback, callbackSpy
            ]);
        });

        it('should call invokeConcurrently only once', function() {
            expect(invokeConcurrentlySpy.callCount).to.equal(1);
        });
    });

    describe('concurrent - callback', function() {

        before(function() {
            Concurrent = require('../../lib/concurrent.js');
        });

        describe('on first invocation with an error with an error', function() {
            var syncState;
            var error = new Error('it rained today');

            beforeEach(function() {
                syncState = {
                    numToDo: 10,
                    numComplete: 3,
                    results: [4,3,2]
                };
                var boundCallback = Concurrent._concurrentCallback.bind(syncState);
                boundCallback(3, callbackSpy, error, 'should be ignored because there is an error');
            });

            it('should invoke process.nextTick once if invoked with an error', function() {
                expect(callbackSpyBindStub.callCount).to.equal(1);
            });

            it('should bind the error to the allDone callback', function() {
                expect(callbackSpyBindStub.args[0]).to.eql([
                    null, error
                ]);
            });

            it('should invoke process.nextTick with the bound allDone callback', function() {
                expect(nextTickStub.args[0]).to.eql([
                    boundCallbackSpy
                ]);
            });

            it('should assign the error to the error property of the syncState', function() {
                expect(syncState).to.eql({
                    numToDo: 10,
                    numComplete: 3,
                    results: [4,3,2],
                    error: error
                });
            });
        });

        describe('on n+1 invocation with an error', function() {
            var syncState;
            var error = new Error('this error is new');

            beforeEach(function() {
                syncState = {
                    numToDo: 10,
                    numComplete: 3,
                    results: [4,3,2],
                    error: new Error('previously recorded')
                };
                var boundCallback = Concurrent._concurrentCallback.bind(syncState);
                boundCallback(3, callbackSpy, error, 'should be ignored because there is an error');
            });

            it('should not invoke process.nextTick', function() {
                expect(callbackSpyBindStub.callCount).to.equal(0);
            });

            it('should not update the syncState', function() {
                expect(syncState).to.eql({
                    numToDo: 10,
                    numComplete: 3,
                    results: [4,3,2],
                    error: new Error('previously recorded')
                });
            });
        });

        describe('invocations without error', function() {
            var testParams;
            beforeEach(function() {
                testParams = {
                    syncState: {
                        numToDo: 10,
                        numComplete: 2,
                        results: [4, 2]
                    },
                    index: 3,
                    result: 'this is result'
                };

                var boundCallback = Concurrent._concurrentCallback.bind(testParams.syncState);
                boundCallback(testParams.index, callbackSpy, null, testParams.result);
            });

            it('should increment the syncState numComplete', function() {
                expect(testParams.syncState.numComplete).to.equal(3);
            });

            it('should update the syncState result at the index position', function() {
                expect(testParams.syncState.results).to.eql([4, 2, ,'this is result']);
            });
        });

        describe('final invocations all without errors', function() {
            var testParams;
            beforeEach(function() {
                testParams = {
                    syncState: {
                        numToDo: 3,
                        numComplete: 2,
                        results: [4, 2]
                    },
                    index: 2,
                    result: 'this is result'
                };

                var boundCallback = Concurrent._concurrentCallback.bind(testParams.syncState);
                boundCallback(testParams.index, callbackSpy, null, testParams.result);
            });

            it('should increment the syncState numComplete', function() {
                expect(testParams.syncState.numComplete).to.equal(3);
            });

            it('should update the syncState result at the index position', function() {
                expect(testParams.syncState.results).to.eql([4, 2, 'this is result']);
            });

            it('should bind null and the syncState results to the allDone callback', function() {
                expect(callbackSpyBindStub.args[0]).to.eql([
                    null, null, [4, 2, 'this is result']
                ]);
            });

            it('should invoke process.nextTick with the bound callback', function() {
                expect(nextTickStub.args[0]).to.eql([boundCallbackSpy]);
            });

            it('should invoke process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });
    });
});
