'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

describe('map-concurrent-all - practical tests', function() {
    this.timeout(10000);

    function iteratee(numberToTest, callback) {
        setTimeout(function() {
            if (numberToTest % 2 === 0) {
                callback(null, `even numbers should succeed ${numberToTest}`);
            } else {
                callback(new Error(`odd odd should fail ${numberToTest}`));
            }

        }, Math.floor((Math.random() * 500) + 50));
    }

    let numInputItems;
    let input;
    let expectedResult;
    let expectedNumErrors;
    let MapConcurrentAll;

    before('setup variables', function() {
        numInputItems = 10;
        MapConcurrentAll = require('../../lib/map-concurrent-all.js');
    });

    describe('some tasks fail, some tasks pass', function() {

        before('setup input', function() {
            input = [];
            for (let i = 0; i < numInputItems; i++) {
                input.push(i);
            }
        });

        before('setup expected result data', function() {
            expectedNumErrors = numInputItems / 2;
            expectedResult = [];
            for (let i = 0; i < numInputItems; ++i) {
                if (i % 2 === 0) {
                    expectedResult.push({error: null, result: `even numbers should succeed ${i}`});
                } else {
                    expectedResult.push({error: new Error(`odd numbers should fail ${i}`), result: null});
                }
            }
        });

        let error;
        let result;
        before('run test', function(done) {
            MapConcurrentAll.mapConcurrentAll(input, iteratee, function(err, res) {
                error = err;
                result = res;
                done();
            });
        });

        it('should produce the expected error count', function() {
            expect(error).to.equal(numInputItems / 2);
        });

        it('should produce the expected result data', function() {
            expect(result).to.eql(expectedResult);
        });
    });

});
