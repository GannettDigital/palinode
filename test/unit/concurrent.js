'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('concurrent', function() {
    this.timeout(10000);

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            if(taskId % 2 === 0) {
                callback(null, `even tasks should succeed ${taskId}`);
            } else {
                callback(`odd tasks should fail ${taskId}`);
            }

        }, Math.floor((Math.random() * 1000) + 50));
    }

    describe('some tasks fail, some tasks succeed', function() {
        let callbackSpy;
        let taskSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            taskSpy = sinon.spy(taskOfRandomDuration);

            const concurrentTasks = [0, 2, 3, 4, 6].map((number) => taskSpy.bind(null, number));
            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent(concurrentTasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call the callback with the first error that called back from the all the input functions', function() {
            expect(callbackSpy.args).to.eql([
                ['odd tasks should fail 3']
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            expect(taskSpy.callCount).to.eql(5);
        });

        it('should call the iteratee with an integer input value and a callback function', function() {
            expect(taskSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
        });
    });

    describe('all tasks succeed', function() {
        let callbackSpy;
        let taskSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            taskSpy = sinon.spy(taskOfRandomDuration);

            const concurrentTasks = [0, 2, 8, 4, 6].map((number) => taskSpy.bind(null, number));
            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent(concurrentTasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call the callback with the first error that called back from the all the input functions', function() {
            expect(callbackSpy.args).to.eql([
                [null, [
                    'even tasks should succeed 0',
                    'even tasks should succeed 2',
                    'even tasks should succeed 8',
                    'even tasks should succeed 4',
                    'even tasks should succeed 6'
                ]]
            ]);
        });

        it('should have called all functions despite errors having occurred', function() {
            expect(taskSpy.callCount).to.eql(5);
        });

        it('should call the iteratee with an integer input value and a callback function', function() {
            expect(taskSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
        });
    });

    describe('empty input', function() {
        let callbackSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const Concurrent = require('../../lib/concurrent.js');
            Concurrent.concurrent([], callbackSpy = sinon.spy(() => done()));
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
