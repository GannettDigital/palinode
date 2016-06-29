'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent - practical test', function() {
    this.timeout(10000);

    var iterateeStub;
    var inputItems;
    var expectedResult;
    var MapConcurrent;

    before('setup variables', function() {
        MapConcurrent = require('../../lib/map-concurrent.js');
    });

    describe('positive practical tests', function() {

        function squareWithDelay(input, callback) {
            setTimeout(function() {
                callback(null, input * input);
            }, Math.floor((Math.random() * 1500) + 150));
        }

        before('setup', function() {
            inputItems = [2, 32, 54, 65, 76];
            iterateeStub = sinon.spy(squareWithDelay);
            expectedResult = inputItems.map(function(item) { return item * item;});
        });

        var error;
        var result;
        before('run test', function(done) {
            MapConcurrent.mapConcurrent(inputItems, iterateeStub, function(err, res) {
                error = err;
                result = res;
                done();
            });
        });

        it('should call back with the expected response when all functions have responded', function() {
            expect(result).to.eql(expectedResult);
        });

        it('should call the iteratee once per input item', function() {
            expect(iterateeStub.callCount).to.equal(inputItems.length);
        });

        it('should invoke the iteratee for each input item in order', function() {
            inputItems.forEach(function(item, index) {
                expect(iterateeStub.args[index][0]).to.eql(item);
            });
        });
    });

    describe('positive practical tests - empty input', function() {

        function squareWithDelay(input, callback) {
            setTimeout(function() {
                callback(null, input * input);
            }, Math.floor((Math.random() * 1500) + 150));
        }

        before('setup', function() {
            inputItems = [];
            iterateeStub = sinon.spy(squareWithDelay);
            expectedResult = [];
        });

        var error;
        var result;
        before('run test', function(done) {
            MapConcurrent.mapConcurrent(inputItems, iterateeStub, function(err, res) {
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

        function squareWithDelay(input, callback) {
            setTimeout(function() {
                if (input * input > 100) {
                    return callback(expectedError);
                }
                callback(null, input * input);
            }, Math.floor((Math.random() * 1500) + 150));
        }

        before('setup', function() {
            inputItems = [3, 4, 6, 7, 11, 21, 31];
            iterateeStub = sinon.spy(squareWithDelay);
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

            MapConcurrent.mapConcurrent(inputItems, iterateeStub, callbackSpy = sinon.spy(callback));
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
