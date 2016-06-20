'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe.only('map-each - unit tests', function() {

    var MapEach;
    var nextTickStub;
    var inputArray = [1,2,3,4,5];

    before(function () {
        MapEach = require('../../lib/map-each.js');
        nextTickStub = sinon.stub(process, 'nextTick');
    });

    beforeEach(function () {
        nextTickStub.reset();
    });

    after(function () {
        process.nextTick.restore();
    });

    describe('map-each - entry-point', function() {
        var mapEachCallbackStub;
        var mapEachCallbackBindStub;
        var iteratee = sinon.spy();
        var iterateeBindStub = sinon.spy();
        var iterateeBindResult = function iterateeBindResult() {};
        var callback = function callback() {};
        var mapEachCallbackBindResult = function mapEachCallbackBindResult() {};

        before(function() {
            mapEachCallbackStub = sinon.stub(MapEach, '_mapEachCallback');
            mapEachCallbackBindStub = sinon.stub(mapEachCallbackStub, 'bind').returns(mapEachCallbackBindResult);
            iterateeBindStub = sinon.stub(iteratee, 'bind').returns(iterateeBindResult);
        });

        beforeEach(function() {
            iterateeBindStub.reset();
            mapEachCallbackStub.reset();
            MapEach.mapEach(inputArray, iteratee, callback);
        });

        after(function() {
            MapEach._mapEachCallback.restore();
        });

        it('should bind the callback, input array, iteratee, index and accumulator to the mapEachCallback', function() {
            expect(mapEachCallbackBindStub.args[0]).eql([
               null, callback, inputArray, iteratee, 0, []
            ]);
        });

        it('should bind the first element of the input array, and the bound callback to the iteratee', function() {
             expect(iterateeBindStub.args[0]).to.eql([
                 null, inputArray[0], mapEachCallbackBindResult
             ]);
        });

        it('should invoke provide the bound iteratee function to process.nextTick', function() {
            expect(nextTickStub.args[0]).to.eql([
               iterateeBindResult
            ]);
        });

        it('should invoke process.nextTick once', function() {
            expect(nextTickStub.callCount).to.equal(1);
        })
    });

    describe('map-each - callback', function() {
        describe('when invoked with an error', function() {

        });

        describe('when invoked with the final array element', function() {

        });

        describe('when invoked with the n-1th array element', function() {

        });
    });
});