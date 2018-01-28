'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('concurrent-all - practical tests', function() {
    this.timeout(10000);

    describe('some tasks fail, some tasks succeed', function() {
        const callbackSpy = sinon.spy();
        let concurrentTasks;

        before('setup tasks to perform concurrently', function() {

            function taskOfRandomDuration(taskId, callback) {
                setTimeout(function() {
                    if (taskId % 2 === 0) {
                        callback(null, `even tasks should succeed ${taskId}`);
                    } else {
                        callback(`odd tasks should fail ${taskId}`);
                    }

                }, Math.floor((Math.random() * 500) + 50));
            }

            concurrentTasks = [];
            for (let i = 0; i < 4; i++) {
                const spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                concurrentTasks.push(spy);
            }
        });

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const ConcurrentAll = require('../../lib/concurrent-all.js');
            ConcurrentAll.concurrentAll(concurrentTasks, (error, result) => {
                callbackSpy(error, result);
                done();
            });
        });

        after(function() {
            mockery.disable();
        });

        it(`should call the callback with an error count and the expected results array, containing an element for 
        concurrent task with two properties set appropriately containing the error or result of the task`, function() {
            const expectedErrorCount = 2;
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
                }
            ];

            expect(callbackSpy.args).to.eql([
                [expectedErrorCount, expectedResultsArray]
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            const spyCallCounts = concurrentTasks.map((task) => task.callCount);

            expect(spyCallCounts).to.eql([1, 1, 1, 1]);
        });
    });
});
