'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('concurrent - practical test', function() {
    this.timeout(10000);

    function successfulTaskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            callback(null, `i am task ${taskId}`);
        }, Math.floor((Math.random() * 1500) + 150));
    }

    describe('positive practical tests', function() {
        let callbackSpy;
        let concurrentTasks;

        before('setup tasks to perform concurrently', function() {
            concurrentTasks = [];
            for (let i = 0; i < 4; i++) {
                const spy = sinon.spy(successfulTaskOfRandomDuration.bind(null, i));
                concurrentTasks.push(spy);
            }
        });

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent(concurrentTasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function(){
            mockery.disable();
        });

        it(`should call the callback with an error count and the expected results array, containing an element 
        with the result of each concurrent task`, function() {
            const expectedError = null;
            const expectedResultsArray = [
                "i am task 0",
                "i am task 1",
                "i am task 2",
                "i am task 3"
            ];

            expect(callbackSpy.args).to.eql([
                [expectedError, expectedResultsArray]
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            const spyCallCounts = concurrentTasks.map((task) => task.callCount);

            expect(spyCallCounts).to.eql([1, 1, 1, 1]);
        });
    });

    describe('positive practical tests - empty input', function() {
        let callbackSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent([], callbackSpy = sinon.spy(() => done()));
        });

        after(function(){
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

    describe('one function calling back with error', function() {
        let concurrentTasks;
        let callbackSpy;

        function callbackSuccessImmediately(taskId, callback) {
            setTimeout(function() {
                callback(null, taskId);
            }, taskId * 100);
        }

        function callbackErrorImmediately(taskId, callback) {
            setTimeout(function() {
                callback('we could not do it all');
            }, taskId * 100);
        }

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            concurrentTasks = [
                callbackSuccessImmediately.bind(null, 1),
                callbackSuccessImmediately.bind(null, 2),
                callbackSuccessImmediately.bind(null, 3),
                callbackErrorImmediately.bind(null, 4),
                callbackSuccessImmediately.bind(null, 5),
                callbackSuccessImmediately.bind(null, 6),
                callbackSuccessImmediately.bind(null, 7)
            ];

            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent(concurrentTasks, callbackSpy = sinon.spy(() => done()));
        });

        it('should callback with an error if one of the tasks calls back with error', function() {
            expect(callbackSpy.args).to.eql([
                ['we could not do it all']
            ]);
        });

        it('should invoke the callback only once', function() {
            expect(callbackSpy.callCount).to.equal(1);
        });
    });
});
