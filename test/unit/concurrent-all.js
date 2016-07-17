'use strict';

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

    var mapConcurrentCallbackBindStub;
    var boundConcurrentCallback = function concurrentCallbackBindResult() {};

    before(function() {
        Concurrent = require('../../lib/concurrent.js');
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
        var task1Stub = sinon.stub();
        var task2Stub = sinon.stub();
        task1Stub.bind = sinon.stub().returns(task1Bound);
        task2Stub.bind = sinon.stub().returns(task2Bound);

        function task1Bound() {}
        function task2Bound() {}

        var tasks = [
            task1Stub,
            task2Stub
        ];

        var syncState = {
            numToDo: tasks.length,
            numComplete: 0,
            results: []
        };

        before(function() {
            mapConcurrentCallbackBindStub = sinon.stub(Concurrent._concurrentCallback, 'bind').returns(boundConcurrentCallback);
        });

        after(function() {
            Concurrent._concurrentCallback.bind.restore();
        });

        beforeEach(function() {
            tasks.forEach(function(task) {task.bind.reset();});
            mapConcurrentCallbackBindStub.reset();
            Concurrent.concurrent(tasks, callbackSpy);
        });

        it('should bind the synchronization state, current index and callback to the _concurrentCallback - for each task', function() {
            expect(mapConcurrentCallbackBindStub.args).to.eql([
                [syncState, 0, callbackSpy],
                [syncState, 1, callbackSpy]
            ]);
        });

        it('should bind _concurrentCallback once for each task', function() {
            expect(mapConcurrentCallbackBindStub.callCount).to.equal(tasks.length);
        });

        it('should bind the bound _concurrentCallback to each task', function() {
            var expectedBoundArgs = tasks.map(function(task) {
                return task.bind.args[0];
            });
            expect(expectedBoundArgs).to.eql([
                [null, boundConcurrentCallback],
                [null, boundConcurrentCallback]
            ]);
        });

        it('should call bind on all tasks', function() {
            var result = tasks.map(function(task) { return task.bind.callCount;});
            expect(result).to.all.equal(1);
        });

        it('should invoke process.nextTick once for each task', function() {
            expect(nextTickStub.callCount).to.equal(tasks.length);
        });
    });

    describe('concurrent - entry point - empty input', function() {
        var tasks = [];
        var forEachStub;
        before(function() {
            mapConcurrentCallbackBindStub = sinon.stub(Concurrent._concurrentCallback, 'bind').returns(boundConcurrentCallback);
            forEachStub = sinon.stub(Array.prototype, 'forEach');
        });

        after(function() {
            Concurrent._concurrentCallback.bind.restore();
            Array.prototype.forEach.restore();
        });

        beforeEach(function() {
            forEachStub.reset();
            mapConcurrentCallbackBindStub.reset();
            Concurrent.concurrent(tasks, callbackSpy);
        });

        it('should bind null and empty array to the callback', function() {
            expect(callbackSpyBindStub.args[0]).to.eql([
                null, null, []
            ]);
        });

        it('should invoke process.nextTick once for each task', function() {
            expect(nextTickStub.callCount).to.equal(1);
        });

        it('should invoke process.nextTick with the bound callback', function() {
            expect(nextTickStub.args[0]).to.eql([
               boundCallbackSpy
            ]);
        });

        it('should not call forEach when the input is an empty array', function() {
            expect(forEachStub.callCount).to.equal(0);
        });
    });

    describe('concurrent - callback', function() {

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
