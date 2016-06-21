'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('map-each - unit tests', function() {

    var MapEach;
    var nextTickStub;
    var inputArray = [1,2,3,4,5];
    var iteratee;
    var iterateeBindStub;
    var iterateeBindStubResult = function iterateeBindResult() {};

    var mapEachCallbackStub;
    var mapEachCallbackBindStub;
    var mapEachCallbackBindResult = function mapEachCallbackBindResult() {};

    before(function() {
        MapEach = require('../../lib/map-each.js');
        nextTickStub = sinon.stub(process, 'nextTick');

        iteratee = sinon.spy();
        iterateeBindStub = sinon.stub(iteratee, 'bind').returns(iterateeBindStubResult);
    });

    beforeEach(function() {
        nextTickStub.reset();
        iterateeBindStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('map-each - entry-point', function() {

        var callback = function callback() {};

        before(function() {
            mapEachCallbackStub = sinon.stub(MapEach, '_mapEachCallback');
            mapEachCallbackBindStub = sinon.stub(mapEachCallbackStub, 'bind').returns(mapEachCallbackBindResult);
        });

        beforeEach(function() {
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
               iterateeBindStubResult
            ]);
        });

        it('should invoke process.nextTick once', function() {
            expect(nextTickStub.callCount).to.equal(1);
        });
    });

    describe('map-each - callback', function() {
        var allDoneStub;
        var allDoneBindStub;
        var allDoneBindResult = function allDoneBound() {};

        before(function() {
            allDoneStub = sinon.stub();
            allDoneBindStub = sinon.stub(allDoneStub, 'bind').returns(allDoneBindResult);
        });

        beforeEach(function() {
            allDoneBindStub.reset();
        });

        describe('when invoked with an error', function() {

            var expectedError = new Error('not making any promises');

            beforeEach(function() {
                MapEach._mapEachCallback(allDoneStub, inputArray, iteratee, 0, [], expectedError);
            });

            it('should bind the error to the allDone callback', function() {
                expect(allDoneBindStub.args[0]).to.eql([
                    null, expectedError
                ]);
            });

            it('should pass the bound allDone callback to process.nextTick', function() {
                expect(nextTickStub.args[0]).to.eql([allDoneBindResult]);
            });

            it('should invoke process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });

        describe('when invoked for last callback of the iteratee', function() {
            beforeEach(function() {
                MapEach._mapEachCallback(allDoneStub, inputArray, iteratee, 4, ['yay', 'res', 'u', 'lts'], null, 'here');
            });

            it('should bind null and the results array to the allDone callback', function() {
                expect(allDoneBindStub.args[0]).to.eql([
                    null, null, ['yay', 'res', 'u', 'lts', 'here']
                ]);
            });

            it('should pass the bound allDone callback to process.nextTick', function() {
                expect(nextTickStub.args[0]).to.eql([allDoneBindResult]);
            });

            it('should invoke process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });

        describe('when invoked with the n-1th array element', function() {

            before(function() {
                mapEachCallbackBindStub = sinon.stub(MapEach._mapEachCallback, 'bind').returns(mapEachCallbackBindResult);
            });

            beforeEach(function() {
                MapEach._mapEachCallback(allDoneStub, inputArray, iteratee, 3, ['yay', 'res', 'u'], null, 'lts');
            });

            after(function() {
                MapEach._mapEachCallback.restore();
            });

            it('should bind allDone callback, inputArray, forEachMethod, index and results to the mapEach callback', function() {
                expect(mapEachCallbackBindStub.args[0]).to.eql([
                    null, allDoneStub, inputArray, iteratee, 4, ['yay', 'res', 'u', 'lts']
                ]);
            });

            it('should bind the next value of the input array and the bound mapEachCallback to the iteratee', function() {
                expect(iterateeBindStub.args[0]).to.eql([
                    null, inputArray[4], mapEachCallbackBindResult
                ]);
            });

            it('should invoke process.nextTick with the bound iteratee', function() {
                expect(nextTickStub.args[0]).to.eql([iterateeBindStubResult]);
            });

            it('should invoke process.nextTick once', function() {
                expect(nextTickStub.callCount).to.equal(1);
            });
        });
    });
});
