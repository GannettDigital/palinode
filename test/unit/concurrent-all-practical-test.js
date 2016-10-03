'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

describe('concurrent-all - practical tests', function() {
    this.timeout(10000);

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            if (taskId % 2 === 0) {
                callback(null, 'even tasks should succeed ' + taskId);
            } else {
                callback(new Error('odd tasks should fail ' + taskId));
            }

        }, Math.floor((Math.random() * 500) + 50));
    }

    var numTasksToRun;
    var tasks;
    var expectedResult;
    var expectedNumErrors;
    var ConcurrentAll;

    before('setup variables', function() {
        numTasksToRun = 10;
        ConcurrentAll = require('../../lib/concurrent-all.js');
    });

    describe('some tasks fail, some tasks pass', function() {

        before('setup input functions', function() {
            tasks = [];
            for (var i = 0; i < numTasksToRun; i++) {
                var spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                tasks.push(spy);
            }
        });

        before('setup expected result data', function() {
            expectedNumErrors = numTasksToRun / 2;
            expectedResult = [];
            for (var i = 0; i < numTasksToRun; ++i) {
                if (i % 2 === 0) {
                    expectedResult.push({error: null, result: 'even tasks should succeed ' + i});
                } else {
                    expectedResult.push({error: new Error('odd tasks should fail ' + i), result: null});
                }
            }
        });

        var error;
        var result;
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
