'use strict';

var sinon = require('sinon');
var expect = require('chai').expect;

describe('series', function() {

    var MapEach;
    var nextTickStub;

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

    });

    describe('map-eaech - callback', function() {
        describe('when invoked with an error', function() {

        });

        describe('when invoked with the final array element', function() {

        });

        describe('when invoked with the n-1th array element', function() {

        });
    });
});