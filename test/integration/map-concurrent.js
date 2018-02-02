'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent', function() {
    this.timeout(10000);

    function squareWithDelay(input, callback) {
        setTimeout(function() {
            callback(null, input * input);
        }, Math.floor((Math.random() * 1500) + 150));
    }

    describe('all tasks succeed', function() {
        let callbackSpy;
        let iterateeSpy;

        before('setup and run tests', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapConcurrent = require('../../lib/map-concurrent.js');

            MapConcurrent.mapConcurrent(
                [2, 32, 54, 65, 76],
                iterateeSpy = sinon.spy(squareWithDelay),
                callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call back with null and a result array containing an element for task result', function() {
            expect(callbackSpy.args).to.eql([
                [null, [
                    4,
                    1024,
                    2916,
                    4225,
                    5776
                ]]
            ]);
        });

        it('should call the iteratee once per input item', function() {
            expect(iterateeSpy.callCount).to.equal(5);
        });

        it('should invoke the iteratee for each input item in order', function() {
            const calledWithArgs = iterateeSpy.args.map((args) => args[0]);

            expect(calledWithArgs).to.eql([2, 32, 54, 65, 76]);
        });

        it('should invoke the iteratee for each input item and a callback function', function() {
            expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
        });
    });

    describe('input is an empty array', function() {
        let callbackSpy;
        let taskSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapConcurrent = require('../../lib/map-concurrent.js');
            MapConcurrent.mapConcurrent([], taskSpy = sinon.spy(), callbackSpy = sinon.spy(() => done()));
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

        it('should not call the task', function() {
            expect(taskSpy.callCount).to.equal(0);
        });
    });

    describe('one function calls back with error', function() {
        let callbackSpy;

        function asyncTaskToDo(taskId, callback) {
            setTimeout(function() {
                if (taskId === 2) {
                    return callback('Error: we could not do it all');
                }
                callback(null, taskId);
            }, taskId * 100);
        }

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapConcurrent = require('../../lib/map-concurrent.js');
            MapConcurrent.mapConcurrent([0, 1, 2, 3, 4, 5], asyncTaskToDo, callbackSpy = sinon.spy(() => done()));
        });

        it('should callback with an error if one of the tasks calls back with error', function() {
            expect(callbackSpy.args).to.eql([
                ['Error: we could not do it all']
            ]);
        });

        it('should invoke the callback only once', function() {
            expect(callbackSpy.callCount).to.equal(1);
        });
    });
});
