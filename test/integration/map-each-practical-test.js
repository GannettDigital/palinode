'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('map-each - practical test', function() {


    describe('all tasks succeed', function() {

    });

    describe('a task fails halfway through execution', function() {

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

    let MapEach;
    const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let squareSpy;
    function square(input, callback) {
        callback(null, input * input);
    }

    before(function() {
        MapEach = require('../../lib/map-each.js');
        squareSpy = sinon.spy(square);
    });

    let error;
    let result;
    beforeEach(function(done) {
        squareSpy.reset();
        MapEach.mapEach(inputArray, squareSpy, function(err, res) {
            error = err;
            result = res;
            done();
        });
    });

    it('should execute the provided callback for each element in the input array', function() {
        expect(result).to.eql([1, 4, 9, 16, 25, 36, 49, 64, 81, 100]);
    });

    it('should call the iteratee once for each member of the input array', function() {
        expect(squareSpy.callCount).to.equal(inputArray.length);
    });
});
