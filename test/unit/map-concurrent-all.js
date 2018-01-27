'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent-all - unit tests', function() {
    let MapConcurrentAll;
    let callbackSpy;
    let concurrentAllSpy;

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
        const iterateeStub = sinon.stub();
        const iterateeBindStub = sinon.stub(iterateeStub, 'bind').returns(boundIteratee);

        function boundIteratee() {}

        const inputItems = [1, 2];

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
        const iterateeStub = sinon.stub();
        const iterateeBindStub = sinon.stub(iterateeStub, 'bind').returns(boundIteratee);

        function boundIteratee() {}

        const inputItems = [];

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
