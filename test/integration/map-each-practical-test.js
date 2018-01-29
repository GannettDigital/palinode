'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

describe('map-each - practical test', function() {
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
