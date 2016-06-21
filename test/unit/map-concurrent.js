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
    var boundCallbackSpy = function boundCallbackSpy(){}

    var mapConcurrentCallbackBindStub;
    var boundMapConcurrentCallback = function mapConcurrentCallbackBindResult() {};

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
            mapConcurrentCallbackBindStub = sinon.stub(MapConcurrent._mapConcurrentCallback, 'bind').returns(boundMapConcurrentCallback);
        });

        after(function() {
            MapConcurrent._mapConcurrentCallback.bind.restore();
        });

        beforeEach(function() {
            tasks.forEach(function(task) {task.bind.reset()});
            mapConcurrentCallbackBindStub.reset();
            MapConcurrent.mapConcurrent(tasks, callbackSpy);
        });

        it('should bind the synchronization state, current index and callback to the _mapConcurrentCallback - for each task', function() {
            expect(mapConcurrentCallbackBindStub.args).to.eql([
                [syncState, 0, callbackSpy],
                [syncState, 1, callbackSpy]
            ]);
        });

        it('should bind _mapConcurrentCallback once for each task', function() {
            expect(mapConcurrentCallbackBindStub.callCount).to.equal(tasks.length);
        });

        it('should bind the bound _mapConcurrentCallback to each task', function() {
            var expectedBoundArgs = tasks.map(function (task) {
                return task.bind.args[0]
            });
            expect(expectedBoundArgs).to.eql([
                [null, boundMapConcurrentCallback],
                [null, boundMapConcurrentCallback]
            ]);
        });

        it('should call bind on all tasks', function() {
            var result = tasks.map(function(task) { return task.bind.callCount});
            expect(result).to.all.equal(1);
        });

        it('should invoke process.nextTick once for each task', function() {
            expect(nextTickStub.callCount).to.equal(tasks.length);
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


    });

});
