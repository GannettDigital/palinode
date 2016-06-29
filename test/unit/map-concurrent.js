'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent - unit tests', function() {
    var MapConcurrent;
    var callbackSpy;
    var concurrentSpy;

    before(function() {
        concurrentSpy = sinon.spy();
        callbackSpy = sinon.spy();
        concurrentSpy = sinon.spy();

        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../lib/map-concurrent.js');
        mockery.registerMock('./concurrent.js', {concurrent: concurrentSpy});

        MapConcurrent = require('../../lib/map-concurrent.js');
    });

    beforeEach(function() {
        callbackSpy.reset();
        concurrentSpy.reset();
    });

    after(mockery.disable);

    describe('map-concurrent - entry point', function() {
        var iterateeStub = sinon.stub();
        var iterateeBindStub = sinon.stub(iterateeStub, 'bind').returns(boundIteratee);

        function boundIteratee() {}

        var inputItems = [1, 2];

        after(function() {
            iterateeBindStub.restore();
        });

        beforeEach(function() {
            iterateeStub.reset();
            iterateeBindStub.reset();
            MapConcurrent.mapConcurrent(inputItems, iterateeStub, callbackSpy);
        });

        it('should bind the input item to each task function', function() {
            expect(iterateeBindStub.args).to.eql([
                [null, 1],
                [null, 2]
            ]);
        });

        it('should invoke concurrent with the bound iteratees and the callback', function() {
            expect(concurrentSpy.args[0]).to.eql([
                [boundIteratee, boundIteratee], callbackSpy
            ]);
        });
    });

    describe('map-concurrent - entry point - empty input', function() {
        var iterateeStub = sinon.stub();
        var iterateeBindStub = sinon.stub(iterateeStub, 'bind').returns(boundIteratee);

        function boundIteratee() {}

        var inputItems = [];

        after(function() {
            iterateeBindStub.restore();
        });

        beforeEach(function() {
            iterateeStub.reset();
            iterateeBindStub.reset();
            MapConcurrent.mapConcurrent(inputItems, iterateeStub, callbackSpy);
        });

        it('should bind the input item to each task function', function() {
            expect(iterateeBindStub.callCount).to.equal(0);
        });

        it('should invoke concurrent with the bound iteratees and the callback', function() {
            expect(concurrentSpy.args[0]).to.eql([
                [], callbackSpy
            ]);
        });
    });
});
