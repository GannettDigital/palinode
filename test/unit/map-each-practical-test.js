'use strict';

var expect = require('chai').expect;

describe('map-each - practical test', function() {
    var MapEach;

    before(function() {
        MapEach = require('../../lib/map-each.js');
    });

    it('should execute the provided callback for each element in the input array', function(done) {
        var inputArray = [1,2,3,4,5,6,7,8,9,10];

        MapEach.mapEach(inputArray, square, function(error, result) {
            expect(result).to.eql([1,4,9,16,25,36,49,64,81,100]);
            done();
        });
    });

    function square(input, callback) {
        callback(null, input * input);
    }
});
