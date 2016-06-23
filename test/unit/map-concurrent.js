'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent - unit tests', function() {
    var MapConcurrent;
    var nextTickStub;
    var callbackSpy;
    var callbackSpyBindStub;
    var boundCallbackSpy = function boundCallbackSpy() {};

    var mapConcurrentCallbackBindStub;
    var boundConcurrentCallback = function mapConcurrentCallbackBindResult() {};

    before(function() {
        MapConcurrent = require('../../lib/map-concurrent.js');
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

    describe('map-concurrent - entry point', function() {
        var iterateeStub = sinon.stub();
        var iterateeBindStub = sinon.stub(iterateeStub, 'bind').returns(boundIteratee);

        function boundIteratee() {}

        var inputItems = [1, 2];

        var syncState = {
            numToDo: inputItems.length,
            numComplete: 0,
            results: []
        };

        before(function() {
            mapConcurrentCallbackBindStub = sinon.stub(MapConcurrent._mapConcurrentCallback, 'bind').returns(boundConcurrentCallback);
        });

        after(function() {
            iterateeBindStub.restore();
            MapConcurrent._mapConcurrentCallback.bind.restore();
        });

        beforeEach(function() {
            iterateeStub.reset();
            iterateeBindStub.reset();
            mapConcurrentCallbackBindStub.reset();
            MapConcurrent.mapConcurrent(inputItems, iterateeStub, callbackSpy);
        });

        it('should bind the synchronization state, current index and callback to the _mapConcurrentCallback - for each inputItem', function() {
            expect(mapConcurrentCallbackBindStub.args).to.eql([
                [syncState, 0, callbackSpy],
                [syncState, 1, callbackSpy]
            ]);
        });

        it('should bind _mapConcurrentCallback once for each input item', function() {
            expect(mapConcurrentCallbackBindStub.callCount).to.equal(inputItems.length);
        });

        it('should bind the bound _mapConcurrentCallback to the task function for each input item', function() {
            expect(iterateeBindStub.args).to.eql([
                [null, 1, boundConcurrentCallback],
                [null, 2, boundConcurrentCallback]
            ]);
        });

        it('should invoke process.nextTick once for each input item', function() {
            expect(nextTickStub.callCount).to.equal(inputItems.length);
        });
    });

    describe('map-concurrent - callback', function() {

        describe('on first invocation with an error with an error', function() {
            var syncState;
            var error = new Error('it rained today');

            beforeEach(function() {
                syncState = {
                    numToDo: 10,
                    numComplete: 3,
                    results: [4,3,2]
                };
                var boundCallback = MapConcurrent._mapConcurrentCallback.bind(syncState);
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
                var boundCallback = MapConcurrent._mapConcurrentCallback.bind(syncState);
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

                var boundCallback = MapConcurrent._mapConcurrentCallback.bind(testParams.syncState);
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

                var boundCallback = MapConcurrent._mapConcurrentCallback.bind(testParams.syncState);
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
