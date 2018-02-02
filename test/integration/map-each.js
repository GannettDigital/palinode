'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('map-each', function() {
    this.timeout(10000);

    function taskOfRandomDuration(taskId, callback) {
        setTimeout(function() {
            if (taskId % 2 === 0) {
                callback(null, `even tasks should succeed ${taskId}`);
            } else {
                callback(`odd tasks should fail ${taskId}`);
            }

        }, Math.floor((Math.random() * 500) + 50));
    }

    describe('all tasks succeed', function() {
        let callbackSpy;
        let iterateeSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapEach = require('../../lib/map-each.js');
            MapEach.mapEach([0, 2, 4, 6, 8], iterateeSpy = sinon.spy(taskOfRandomDuration), callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call back with null and a result array containing an element for task result', function() {
            expect(callbackSpy.args).to.eql([
                [null, [
                    'even tasks should succeed 0',
                    'even tasks should succeed 2',
                    'even tasks should succeed 4',
                    'even tasks should succeed 6',
                    'even tasks should succeed 8'
                ]]
            ]);
        });

        it('should call the iteratee once per input item', function() {
            expect(iterateeSpy.callCount).to.equal(5);
        });

        it('should invoke the iteratee for each input item in order', function() {
            const calledWithArgs = iterateeSpy.args.map((args) => args[0]);

            expect(calledWithArgs).to.eql([0, 2, 4, 6, 8]);
        });

        it('should invoke the iteratee for each input item and a callback function', function() {
            expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
        });
    });

    describe('a task fails halfway through execution', function() {
        let callbackSpy;
        let iterateeSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapEach = require('../../lib/map-each.js');
            MapEach.mapEach([0, 2, 3, 4, 6], iterateeSpy = sinon.spy(taskOfRandomDuration), callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should callback with an error if one of the tasks calls back with error', function() {
            expect(callbackSpy.args).to.eql([
                ['odd tasks should fail 3']
            ]);
        });

        it('should invoke the callback only once', function() {
            expect(callbackSpy.callCount).to.equal(1);
        });

        it('should not attempt any additional tasks after the one tha fails', function() {
            expect(iterateeSpy.callCount).to.equal(3);
        });

        it('should invoke the iteratee for each input item and a callback function', function() {
            expect(iterateeSpy.alwaysCalledWith(sinon.match.number, sinon.match.func)).to.equal(true);
        });
    });

    describe('input is an empty array', function() {
        let callbackSpy;
        let iterateeSpy;

        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const MapEach = require('../../lib/map-each.js');
            MapEach.mapEach([], iterateeSpy = sinon.spy(), callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should not call the iteratee', function() {
            expect(iterateeSpy.callCount).to.equal(0);
        });

        it('should call the callback with null error and an empty array for the result', function() {
            const expectedError = null;
            const expectedResultsArray = [];

            expect(callbackSpy.args).to.eql([
                [expectedError, expectedResultsArray]
            ]);
        });
    });

});
