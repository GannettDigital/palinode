'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));

describe('index - unit tests', function() {
    let series;
    let mapEach;
    let concurrent;
    let concurrentAll;
    let mapConcurrent;
    let mapConcurrentAll;
    let throttledMapConcurrentAll;
    let throttledConcurrentAll;
    let palinode;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../index.js');

        mockery.registerMock('./lib/series.js', {series: series = sinon.stub()});
        mockery.registerMock('./lib/map-each.js', {mapEach: mapEach = sinon.stub()});
        mockery.registerMock('./lib/concurrent.js', {concurrent: concurrent = sinon.stub()});
        mockery.registerMock('./lib/concurrent-all.js', {concurrentAll: concurrentAll = sinon.stub()});
        mockery.registerMock('./lib/map-concurrent.js', {mapConcurrent: mapConcurrent = sinon.stub()});
        mockery.registerMock('./lib/map-concurrent-all.js', {mapConcurrentAll: mapConcurrentAll = sinon.stub()});
        mockery.registerMock('./lib/throttled-map-concurrent-all.js', {throttledMapConcurrentAll: throttledMapConcurrentAll = sinon.stub()});
        mockery.registerMock('./lib/throttled-concurrent-all.js', {throttledConcurrentAll: throttledConcurrentAll = sinon.stub()});

        palinode = require('../../index.js');
    });

    afterEach(function() {
        mockery.deregisterAll();ß
        mockery.disable();
    });

    it('should have 6 properties', function() {
        expect(Object.keys(palinode).length).to.equal(8);
    });

    it('should have the property \'series\' with the value from require(\'./lib/series.js\').series', function() {
        expect(palinode.series).to.deep.equal(series);
    });

    it('should have the property \'mapEach\' with the value from require(\'./lib/map-each.js\').mapEach', function() {
        expect(palinode.mapEach).to.deep.equal(mapEach);
    });

    it('should have the property \'concurrent\' with the value from require(\'./lib/concurrent.js\').concurrent', function() {
        expect(palinode.concurrent).to.deep.equal(concurrent);
    });

    it('should have the property \'concurrentAll\' with the value from require(\'./lib/concurrent-all.js\').concurrentAll', function() {
        expect(palinode.concurrentAll).to.deep.equal(concurrentAll);
    });

    it('should have the property \'mapConcurrent\' with the value from require(\'./lib/map-concurrent.js\').mapConcurrent', function() {
        expect(palinode.mapConcurrent).to.deep.equal(mapConcurrent);
    });

    it('should have the property \'mapConcurrentAll\' with the value from require(\'./lib/map-concurrent-all.js\').mapConcurrentAll', function() {
        expect(palinode.mapConcurrentAll).to.deep.equal(mapConcurrentAll);
    });

    it('should have the property \'throttledMapConcurrentAll\' with the value from require(\'./lib/throttled-map-concurrent-all.js\').throttledMapConcurrentAll', function() {
        expect(palinode.throttledMapConcurrentAll).to.deep.equal(throttledMapConcurrentAll);
    });

    it('should have the property \'throttledConcurrentAll\' with the value from require(\'./lib/throttled-concurrent-all.js\').throttledConcurrentAll', function() {
        expect(palinode.throttledConcurrentAll).to.deep.equal(throttledConcurrentAll);
    });
});
