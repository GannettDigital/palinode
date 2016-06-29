'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('concurrent - practical test', function() {
    this.timeout(10000);

    var numTasksToRun;
    var tasks;
    var expectedResult;
    var Concurrent;

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            callback(null, 'i am task ' + taskId);
        }, Math.floor((Math.random() * 1500) + 150));
    }

    before('setup variables', function() {
        numTasksToRun = 10;
        Concurrent = require('../../lib/concurrent.js');
    });

    describe('positive practical tests', function() {

        before('setup input functions', function() {
            tasks = [];
            for (var i = 0; i < 10; i++) {
                var spy = sinon.spy(taskOfRandomDuration.bind(null, i));
                tasks.push(spy);
            }
        });

        before('setup expected result data', function() {
            expectedResult = [];
            for (var i = 0; i < 10; ++i) {
                expectedResult.push('i am task ' + i);
            }
        });

        var error;
        var result;
        before('run test', function(done) {
            Concurrent.concurrent(tasks, function(err, res) {
                error = err;
                result = res;
                done();
            });
        });

        it('should call back with the expected response when all functions have responded', function() {
            expect(result).to.eql(expectedResult);
        });

        it('should call all of the functions once', function() {
            var expectedCallCount = tasks.map(function(spy) {
                return spy.callCount;
            });
            expect(expectedCallCount).to.all.equal(1);
        });
    });

    describe('positive practical tests - empty input', function() {

        before('setup input functions', function() {
            tasks = [];
        });

        before('setup expected result data', function() {
            expectedResult = [];
        });

        var error;
        var result;
        before('run test', function(done) {
            Concurrent.concurrent(tasks, function(err, res) {
                error = err;
                result = res;
                done();
            });
        });

        it('should call back with the expected response when all functions have responded', function() {
            expect(result).to.eql(expectedResult);
        });
    });

    describe('one function calling back with error', function() {

        var expectedError = new Error('we could not do it all');

        function callbackSuccessImmediately(taskId, callback) {
            setTimeout(function() {
                callback(null, taskId);
            }, taskId * 100);
        }

        function callbackErrorImmediately(taskId, callback) {
            setTimeout(function() {
                callback(expectedError);
            }, taskId * 100);
        }

        before('setup input functions', function() {
            tasks = [
                callbackSuccessImmediately.bind(null, 1),
                callbackSuccessImmediately.bind(null, 2),
                callbackSuccessImmediately.bind(null, 3),
                callbackErrorImmediately.bind(null, 4),
                callbackSuccessImmediately.bind(null, 5),
                callbackSuccessImmediately.bind(null, 6),
                callbackSuccessImmediately.bind(null, 7)
            ];
        });

        var error;
        var result;
        var callbackSpy;
        before('run test', function(done) {
            function callback(err, res) {
                error = err;
                result = res;
                done();
            }

            Concurrent.concurrent(tasks, callbackSpy = sinon.spy(callback));
        });

        it('should callback with an error if one of the tasks calls back with error', function() {
            expect(error).to.eql(expectedError);
        });

        it('should not provide an undefined result', function() {
            expect(result).to.equal(undefined);
        });

        it('should invoke the callback only once', function() {
            expect(callbackSpy.callCount).to.equal(1);
        });
    });
});
