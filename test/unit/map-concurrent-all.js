'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent-all - unit tests', function() {
    var MapConcurrentAll;
    var callbackSpy;
    var concurrentAllSpy;

    before(function() {
        callbackSpy = sinon.spy();

        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../lib/map-concurrent-all.js');
        mockery.registerMock('./concurrent-all.js', {concurrentAll: concurrentAllSpy = sinon.spy()});

        MapConcurrentAll = require('../../lib/map-concurrent-all.js');
    });

    beforeEach(function() {
        callbackSpy.reset();
        concurrentAllSpy.reset();
    });

    after(mockery.disable);

    describe('map-concurrent-all - entry point', function() {
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
            MapConcurrentAll.mapConcurrentAll(inputItems, iterateeStub, callbackSpy);
        });

        it('should bind the input item to each task function', function() {
            expect(iterateeBindStub.args).to.eql([
                [null, 1],
                [null, 2]
            ]);
        });

        it('should invoke concurrent with the bound iteratees and the callback', function() {
            expect(concurrentAllSpy.args[0]).to.eql([
                [boundIteratee, boundIteratee], callbackSpy
            ]);
        });
    });

    describe('map-concurrent-all - entry point - empty input', function() {
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
            MapConcurrentAll.mapConcurrentAll(inputItems, iterateeStub, callbackSpy);
        });

        it('should bind the input item to each task function', function() {
            expect(iterateeBindStub.callCount).to.equal(0);
        });

        it('should invoke concurrent with the bound iteratees and the callback', function() {
            expect(concurrentAllSpy.args[0]).to.eql([
                [], callbackSpy
            ]);
        });
    });
});
