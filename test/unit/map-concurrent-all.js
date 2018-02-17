'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('map-concurrent-all', function() {
    this.timeout(10000);

    describe('some tasks fail, some tasks succeed', function() {
        let callbackSpy;
        let taskSpy;

        function taskOfRandomDuration(taskId, callback) {
            setTimeout(function() {
                if(taskId % 2 === 0) {
                    callback(null, `even tasks should succeed ${taskId}`);
                } else {
                    callback(`odd tasks should fail ${taskId}`);
                }

            }, Math.floor((Math.random() * 500) + 50));
        }

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapConcurrentAll = require('../../lib/map-concurrent-all.js');
            MapConcurrentAll.mapConcurrentAll([0, 1, 2, 3], taskSpy = sinon.spy(taskOfRandomDuration), callbackSpy = sinon.spy(() => done()));
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
            expect(taskSpy.callCount).to.equal(4);
        });
    });

    describe('input is an empty array', function() {
        let callbackSpy;
        let taskSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapConcurrentAll = require('../../lib/map-concurrent-all.js');
            MapConcurrentAll.mapConcurrentAll([], taskSpy = sinon.spy(), callbackSpy = sinon.spy(() => done()));
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
});
