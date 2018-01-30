'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('throttled-concurrent-all - practical tests', function() {
    this.timeout(10000);

    describe('some tasks fail, some tasks succeed, with numWorkers not set', function() {
        let callbackSpy;
        let concurrentTasks;

        before('setup tasks to perform concurrently', function() {

            function taskOfRandomDuration(taskId, callback) {
                setTimeout(function() {
                    if (taskId % 2 === 0) {
                        callback(null, `even tasks should succeed ${taskId}`);
                    } else {
                        callback(`odd tasks should fail ${taskId}`);
                    }

                }, Math.floor((Math.random() * 1000) + 50));
            }

            concurrentTasks = [];
            for (let i = 0; i < 6; i++) {
                const spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                concurrentTasks.push(spy);
            }
        });

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const ThrottledConcurrentAll = require('../../lib/throttled-concurrent-all.js');
            ThrottledConcurrentAll.throttledConcurrentAll(concurrentTasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it(`should call the callback with an error count and the expected results array, containing an element for 
        concurrent task with two properties set appropriately containing the error or result of the task`, function() {
            const expectedErrorCount = 3;
            const expectedResultsArray = [
                {
                    error: null,
                    result: 'even tasks should succeed 0'
                },
                {
                    error: 'odd tasks should fail 1',
                    result: null
                },
                {
                    error: null,
                    result: 'even tasks should succeed 2'
                },
                {
                    error: 'odd tasks should fail 3',
                    result: null
                },
                {
                    error: null,
                    result: 'even tasks should succeed 4'
                },
                {
                    error: 'odd tasks should fail 5',
                    result: null
                }
            ];

            expect(callbackSpy.args).to.eql([
                [expectedErrorCount, expectedResultsArray]
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            const spyCallCounts = concurrentTasks.map((task) => task.callCount);

            expect(spyCallCounts).to.eql([1, 1, 1, 1, 1, 1]);
        });
    });

    describe('positive practical tests - empty input, with numWorkers not set', function() {
        let callbackSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const ThrottledConcurrentAll = require('../../lib/throttled-concurrent-all.js');
            ThrottledConcurrentAll.throttledConcurrentAll([], callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call the callback with an error count and an empty array for the result', function() {
            const expectedError = null;
            const expectedResultsArray = [];

            expect(callbackSpy.args).to.eql([
                [expectedError, expectedResultsArray]
            ]);
        });
    });

    describe('some tasks fail, some tasks succeed, with numWorkers set', function() {
        let callbackSpy;
        let concurrentTasks;

        before('setup tasks to perform concurrently', function() {

            function taskOfRandomDuration(taskId, callback) {
                setTimeout(function() {
                    if (taskId % 2 === 0) {
                        callback(null, `even tasks should succeed ${taskId}`);
                    } else {
                        callback(`odd tasks should fail ${taskId}`);
                    }

                }, Math.floor((Math.random() * 1000) + 50));
            }

            concurrentTasks = [];
            for (let i = 0; i < 6; i++) {
                const spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                concurrentTasks.push(spy);
            }
        });

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const ThrottledConcurrentAll = require('../../lib/throttled-concurrent-all.js');
            ThrottledConcurrentAll.throttledConcurrentAll(concurrentTasks, 2, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it(`should call the callback with an error count and the expected results array, containing an element for 
        concurrent task with two properties set appropriately containing the error or result of the task`, function() {
            const expectedErrorCount = 3;
            const expectedResultsArray = [
                {
                    error: null,
                    result: 'even tasks should succeed 0'
                },
                {
                    error: 'odd tasks should fail 1',
                    result: null
                },
                {
                    error: null,
                    result: 'even tasks should succeed 2'
                },
                {
                    error: 'odd tasks should fail 3',
                    result: null
                },
                {
                    error: null,
                    result: 'even tasks should succeed 4'
                },
                {
                    error: 'odd tasks should fail 5',
                    result: null
                }
            ];

            expect(callbackSpy.args).to.eql([
                [expectedErrorCount, expectedResultsArray]
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            const spyCallCounts = concurrentTasks.map((task) => task.callCount);

            expect(spyCallCounts).to.eql([1, 1, 1, 1, 1, 1]);
        });
    });

    describe('positive practical tests - empty input, with numWorkers set', function() {
        let callbackSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const ThrottledConcurrentAll = require('../../lib/throttled-concurrent-all.js');
            ThrottledConcurrentAll.throttledConcurrentAll([], 2, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call the callback with an error count and an empty array for the result', function() {
            const expectedError = null;
            const expectedResultsArray = [];

            expect(callbackSpy.args).to.eql([
                [expectedError, expectedResultsArray]
            ]);
        });
    });
});
