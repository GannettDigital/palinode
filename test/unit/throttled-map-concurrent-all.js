'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('throttled-map-concurrent-all', function() {
    this.timeout(10000);

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            if (taskId % 2 === 0) {
                callback(null, `even tasks should succeed ${taskId}`);
            } else {
                callback(`odd tasks should fail ${taskId}`);
            }

        }, Math.floor((Math.random() * 1000) + 50));
    }

    describe('when numWorkers is set greater than input length', function() {
        describe('some tasks fail, some tasks succeed', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [0, 1, 2, 3, 4, 5],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    12,
                    callbackSpy = sinon.spy(() => done())
                );
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

            it('should call the iteratee once for each item', function() {
                expect(iterateeSpy.callCount).to.equal(6);
            });

            it('should call the iteratee with an integer input value and a callback function', function() {
                expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
            });
        });

        describe('empty input', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    12,
                    callbackSpy = sinon.spy(() => done())
                );
            });

            after(function() {
                mockery.disable();
            });

            it('should call the callback with null error and an empty array for the result', function() {
                const expectedError = null;
                const expectedResultsArray = [];

                expect(callbackSpy.args).to.eql([
                    [expectedError, expectedResultsArray]
                ]);
            });

            it('should not call the iteratee', function() {
                expect(iterateeSpy.notCalled).to.equal(true);
            });
        });
    });

    describe('when numWorkers is set less than input length', function() {
        describe('some tasks fail, some tasks succeed', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [0, 1, 2, 3, 4, 5],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    2,
                    callbackSpy = sinon.spy(() => done())
                );
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

            it('should call the iteratee once for each item', function() {
                expect(iterateeSpy.callCount).to.equal(6);
            });

            it('should call the iteratee with an integer input value and a callback function', function() {
                expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
            });
        });

        describe('empty input', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    2,
                    callbackSpy = sinon.spy(() => done())
                );
            });

            after(function() {
                mockery.disable();
            });

            it('should call the callback with null error and an empty array for the result', function() {
                const expectedError = null;
                const expectedResultsArray = [];

                expect(callbackSpy.args).to.eql([
                    [expectedError, expectedResultsArray]
                ]);
            });

            it('should not call the iteratee', function() {
                expect(iterateeSpy.notCalled).to.equal(true);
            });
        });
    });

    describe('when numWorkers not set', function() {
        describe('some tasks fail, some tasks succeed', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [0, 1, 2, 3, 4, 5],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    callbackSpy = sinon.spy(() => done())
                );
            });

            after(function() {
                mockery.disable();
            });

            it(`should call the callback with an error count and the expected results array, containing an element for 
        each concurrent task with two properties set appropriately containing the error or result of the task`, function() {
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

            it('should call the iteratee once for each item', function() {
                expect(iterateeSpy.callCount).to.equal(6);
            });

            it('should call the iteratee with an integer input value and a callback function', function() {
                expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
            });
        });

        describe('empty input', function() {
            let callbackSpy;
            let iterateeSpy;

            before('run test', function(done) {
                mockery.enable({useCleanCache: true, warnOnUnregistered: false});

                const ThrottledMapConcurrentAll = require('../../lib/throttled-map-concurrent-all.js');
                ThrottledMapConcurrentAll.throttledMapConcurrentAll(
                    [],
                    iterateeSpy = sinon.spy(taskOfRandomDuration),
                    callbackSpy = sinon.spy(() => done())
                );
            });

            after(function() {
                mockery.disable();
            });

            it('should call the callback with null error and an empty array for the result', function() {
                const expectedError = null;
                const expectedResultsArray = [];

                expect(callbackSpy.args).to.eql([
                    [expectedError, expectedResultsArray]
                ]);
            });

            it('should not call the iteratee', function() {
                expect(iterateeSpy.notCalled).to.equal(true);
            });
        });
    });
});
