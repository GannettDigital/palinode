'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('map-concurrent - unit tests', function() {
    var MapConcurrent;
    var nextTickStub;

    var mapEachCallbackStub;
    var mapEachCallbackBindStub;
    var mapEachCallbackBindResult = function mapEachCallbackBindResult() {};

    before(function() {
        MapConcurrent = require('../../lib/map-concurrent.js');
        nextTickStub = sinon.stub(process, 'nextTick');
    });

    beforeEach(function() {
        nextTickStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('map-concurrent - entry point', function() {

    });

    describe('map-concurrent - callback', function() {

    });

});
