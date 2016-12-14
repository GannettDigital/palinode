'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('index - unit tests', function() {
    var series;
    var mapEach;
    var concurrent;
    var concurrentAll;
    var mapConcurrent;
    var mapConcurrentAll;
    var palinode;

    before(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../index.js');
    });

    after(function() {
        mockery.deregisterAll();
        mockery.disable();
    });

    beforeEach(function() {
        series = sinon.stub();
        mapEach = sinon.stub();
        concurrent = sinon.stub();
        concurrentAll = sinon.stub();
        mapConcurrent = sinon.stub();
        mapConcurrentAll = sinon.stub();

        mockery.registerMock('./lib/series.js', {series: series});
        mockery.registerMock('./lib/map-each.js', {mapEach: mapEach});
        mockery.registerMock('./lib/concurrent.js', {concurrent: concurrent});
        mockery.registerMock('./lib/concurrent-all.js', {concurrentAll: concurrentAll});
        mockery.registerMock('./lib/map-concurrent.js', {mapConcurrent: mapConcurrent});
        mockery.registerMock('./lib/map-concurrent-all.js', {mapConcurrentAll: mapConcurrentAll});

    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterMock('./lib/series.js');
        mockery.deregisterMock('./lib/map-each.js');
        mockery.deregisterMock('./lib/concurrent.js');
        mockery.deregisterMock('./lib/concurrent-all.js');
        mockery.deregisterMock('./lib/map-concurrent.js');
        mockery.deregisterMock('./lib/map-concurrent-all.js');
    });

    it('should have 6 properties', function() {
        palinode = require('../../index.js');

        expect(Object.keys(palinode).length).to.equal(6);
    });

    it('should have the property \'series\' with the value from require(\'./lib/series.js\').series', function() {
        palinode = require('../../index.js');

        expect(palinode.series).to.deep.equal(series);
    });

    it('should have the property \'mapEach\' with the value from require(\'./lib/map-each.js\').mapEach', function() {
        palinode = require('../../index.js');

        expect(palinode.mapEach).to.deep.equal(mapEach);
    });

    it('should have the property \'concurrent\' with the value from require(\'./lib/concurrent.js\').concurrent', function() {
        palinode = require('../../index.js');

        expect(palinode.concurrent).to.deep.equal(concurrent);
    });

    it('should have the property \'concurrentAll\' with the value from require(\'./lib/concurrent-all.js\').concurrentAll', function() {
        palinode = require('../../index.js');

        expect(palinode.concurrentAll).to.deep.equal(concurrentAll);
    });

    it('should have the property \'mapConcurrent\' with the value from require(\'./lib/map-concurrent.js\').mapConcurrent', function() {
        palinode = require('../../index.js');

        expect(palinode.mapConcurrent).to.deep.equal(mapConcurrent);
    });

    it('should have the property \'mapConcurrentAll\' with the value from require(\'./lib/map-concurrent-all.js\').mapConcurrentAll', function() {
        palinode = require('../../index.js');

        expect(palinode.mapConcurrentAll).to.deep.equal(mapConcurrentAll);
    });
});
