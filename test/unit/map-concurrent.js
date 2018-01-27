'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent - unit tests', function() {
    let MapConcurrent;
    let callbackSpy;
    let concurrentSpy;

    before(function() {
        callbackSpy = sinon.spy();

        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../lib/map-concurrent.js');
        mockery.registerMock('./concurrent.js', {concurrent: concurrentSpy = sinon.spy()});

        MapConcurrent = require('../../lib/map-concurrent.js');
    });

    beforeEach(function() {
        callbackSpy.reset();
        concurrentSpy.reset();
    });

    after(mockery.disable);

    describe('map-concurrent - entry point', function() {
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
