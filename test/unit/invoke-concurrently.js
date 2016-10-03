'use strict';

var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;

describe('invoke concurrently', function() {

    var invokeConcurrently;
    var nextTickStub;
    var allDoneCallbackSpy;
    var operationSpecificCallbackSpy;

    before(function() {
        operationSpecificCallbackSpy = sinon.spy();
        allDoneCallbackSpy = sinon.spy();
        nextTickStub = sinon.stub(process, 'nextTick');
        invokeConcurrently = require('../../lib/invoke-concurrently.js');
    });

    beforeEach(function() {
        nextTickStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('invocation with an empty array of functions', function() {
        var allDoneBindStub;
        var boundAllDone;

        before(function() {
            allDoneBindStub = sinon.stub(allDoneCallbackSpy, 'bind').returns(boundAllDone = sinon.spy());
        });

        beforeEach(function() {
            allDoneBindStub.reset();
            boundAllDone.reset();
            invokeConcurrently([], operationSpecificCallbackSpy, allDoneCallbackSpy);
        });

        after(function() {
            allDoneCallbackSpy.bind.restore();
        });

        it('should bind null context, null error and an empty array to the allDoneCallbackSpy', function() {
            expect(allDoneBindStub.args[0]).to.eql([null, null, []]);
        });

        it('should bind to the allDoneCallback only once', function() {
            expect(allDoneBindStub.callCount).to.equal(1);
        });

        it('should invoke process.nextTick with the bound allDoneCallback', function() {
            expect(nextTickStub.args[0]).to.eql([boundAllDone]);
        });

        it('should call process.nextTick once', function() {
            expect(nextTickStub.callCount).to.equal(1);
        });
    });

    describe('invocation with multiple functions', function() {
        var operationSpecificCallbackBindStub;
        var boundOperationSpecificCallback;
        var inputFunctions = [
            sinon.spy(), sinon.spy()
        ];

        before(function() {
            inputFunctions.forEach(function(inputFunction, index) {
                inputFunction.bind = sinon.stub().returns('function' + index + '_bindResult');
            });
            operationSpecificCallbackBindStub = sinon.stub(operationSpecificCallbackSpy, 'bind')
                .returns(boundOperationSpecificCallback = sinon.spy());
        });

        beforeEach(function() {
            inputFunctions.forEach(function(inputFunction) {
                inputFunction.reset();
                inputFunction.bind.reset();
            });
            operationSpecificCallbackBindStub.reset();
            invokeConcurrently(inputFunctions, operationSpecificCallbackSpy, allDoneCallbackSpy);
        });

        after(function() {
            operationSpecificCallbackSpy.bind.restore();
        });

        it('should bind the state, index, and allDoneCallback to the operationSpecificCallback for each input function', function() {
            expect(operationSpecificCallbackBindStub.args).to.eql([
                [
                    {
                        numToDo: inputFunctions.length,
                        numComplete: 0,
                        results: []
                    },
                    0,
                    allDoneCallbackSpy
                ], [
                    {
                        numToDo: inputFunctions.length,
                        numComplete: 0,
                        results: []
                    },
                    1,
                    allDoneCallbackSpy
                ]
            ]);
        });

        inputFunctions.forEach(function(inputFunction, index) {
            it('should invoke bind with null context and the bound operation specific callback on the input function at index ' + index, function() {
                expect(inputFunction.bind.args[0]).to.eql([
                    null, boundOperationSpecificCallback
                ]);
            });

            it('should invoke bind only once on the input function at index ' + index, function() {
                expect(inputFunction.bind.callCount).to.equal(1);
            });

            it('should invoke process.nextTick with result of binding the input function at index ' + index, function() {
                expect(nextTickStub.args[index]).to.eql(['function' + index + '_bindResult']);
            });
        });

        it('should invoke process.nextTick once for each input function', function() {
            expect(nextTickStub.callCount).to.equal(inputFunctions.length);
        });
    });
});
