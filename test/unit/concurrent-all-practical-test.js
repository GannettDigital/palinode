'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('concurrent-all - practical tests', function() {
    this.timeout(10000);

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            if (taskId % 2 === 0) {
                callback(null, `even tasks should succeed ${taskId}`);
            } else {
                callback(new Error(`odd tasks should fail ${taskId}`));
            }

        }, Math.floor((Math.random() * 500) + 50));
    }

    let numTasksToRun;
    let tasks;
    let expectedResult;
    let expectedNumErrors;
    let ConcurrentAll;

    before('setup variables', function() {
        numTasksToRun = 10;
        ConcurrentAll = require('../../lib/concurrent-all.js');
    });

    describe('some tasks fail, some tasks pass', function() {

        before('setup input functions', function() {
            tasks = [];
            for (let i = 0; i < numTasksToRun; i++) {
                const spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                tasks.push(spy);
            }
        });

        before('setup expected result data', function() {
            expectedNumErrors = numTasksToRun / 2;
            expectedResult = [];
            for (let i = 0; i < numTasksToRun; ++i) {
                if (i % 2 === 0) {
                    expectedResult.push({error: null, result: `even tasks should succeed ${i}`});
                } else {
                    expectedResult.push({error: new Error(`odd tasks should fail ${i}`), result: null});
                }
            }
        });

        let error;
        let result;
        before('run test', function(done) {
            ConcurrentAll.concurrentAll(tasks, function(err, res) {
                error = err;
                result = res;
                done();
            });
        });

        it('should produce the expected error count', function() {
            expect(error).to.equal(numTasksToRun / 2);
        });

        it('should produce the expected result data', function() {
            expect(result).to.eql(expectedResult);
        });
    });

});
