'use strict';

var mockery = require('mockery');
var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-things'));

describe('concurrent all - unit tests', function() {
    var ConcurrentAll;
    var nextTickStub;
    var callbackSpy;
    var callbackSpyBindStub;
    var boundCallbackSpy = function boundCallbackSpy() {
    };

    before(function() {
        nextTickStub = sinon.stub(process, 'nextTick');
        callbackSpy = sinon.spy();
        callbackSpy.bind = callbackSpyBindStub = sinon.stub().returns(boundCallbackSpy);
    });

    beforeEach(function() {
        nextTickStub.reset();
        callbackSpy.reset();
        callbackSpyBindStub.reset();
    });

    after(function() {
        process.nextTick.restore();
    });

    describe('concurrent all - entry point', function() {
        var invokeConcurrentlySpy;
        var inputFunctions = [
            function one() {},
            function two() {}
        ];

        before(function() {
            mockery.enable({
                useCleanCache: true
            });
            mockery.registerAllowable('../../lib/concurrent-all.js');
            mockery.registerMock('./invoke-concurrently.js', invokeConcurrentlySpy = sinon.spy());
            ConcurrentAll = require('../../lib/concurrent-all.js');
        });

        beforeEach(function() {
            invokeConcurrentlySpy.reset();
            ConcurrentAll.concurrentAll(inputFunctions, callbackSpy);
        });

        after(function() {
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call invokeConcurrently with the inputFunctions, _concurrentCallback and callback', function() {
            expect(invokeConcurrentlySpy.args[0]).to.eql([
                inputFunctions, ConcurrentAll._concurrentAllCallback, callbackSpy
            ]);
        });

        it('should call invokeConcurrently only once', function() {
            expect(invokeConcurrentlySpy.callCount).to.equal(1);
        });
    });

    describe('concurrent all - callback', function() {

        var allDone;
        var context;

        before(function() {
            allDone = sinon.spy();
            allDone.bind = sinon.stub().returns('result of allDone.bind');
            ConcurrentAll = require('../../lib/concurrent-all.js');
        });

        beforeEach(function() {
            allDone.reset();
            allDone.bind.reset();
            context = {
                numToDo: 5,
                numComplete: 0,
                results: []
            };
        });

        describe('invoking with the first error', function() {
            beforeEach(function() {
                ConcurrentAll._concurrentAllCallback.call(context, 4, allDone, 'oh noes an error');
            });

            it('should update the context when it encounters the first error', function() {
                expect(context.numErrors).to.equal(1);
            });

            it('should increment the context numComplete', function() {
                expect(context.numComplete).to.equal(1);
            });

            it('should add the error to the correct position in the result array', function() {
                expect(context.results[4]).to.eql({
                    error: 'oh noes an error',
                    result: null
                });
            });
        });

        describe('invoking with a second error', function() {
            beforeEach(function() {
                context.results[4] = {
                    error: 'oh noes an error',
                    result: null
                };
                context.numErrors = 1;
                context.numComplete = 1;
                ConcurrentAll._concurrentAllCallback.call(context, 3, allDone, 'oh noes an error');
            });

            it('should update the context when it encounters the first error', function() {
                expect(context.numErrors).to.equal(2);
            });

            it('should increment the context numComplete', function() {
                expect(context.numComplete).to.equal(2);
            });

            it('should add the error to the correct position in the result array', function() {
                expect(context.results[3]).to.eql({
                    error: 'oh noes an error',
                    result: null
                });
            });

            it('should accumulate the errors into the results array', function() {
                expect(context.results).to.eql([ ,
                    ,
                    ,
                    {
                        error: 'oh noes an error',
                        result: null
                    },
                    {
                        error: 'oh noes an error',
                        result: null
                    }
                ]);
            });
        });

        describe('invoking without an error', function() {
            var possibleResults = [{an: 'object'}, [1, 'array'], 'string', null, undefined];

            possibleResults.forEach(function(result) {
                describe('invoking with a(n) ' + result + ' result', function() {
                    beforeEach(function() {
                        ConcurrentAll._concurrentAllCallback.call(context, 3, allDone, null, result);
                    });

                    it('should increment the context numComplete', function() {
                        expect(context.numComplete).to.equal(1);
                    });

                    it('should set the appropriate element in the results array', function() {
                        expect(context.results).to.eql([ ,
                            ,
                            ,
                            {error: null, result: result}
                        ]);
                    });

                    it('should not increment the errors counter', function() {
                        expect(context.numErrors).to.equal(undefined);
                    });
                });
            });
        });

        describe('invoking with a truthy error and a truthy result', function() {
            beforeEach(function() {
                ConcurrentAll._concurrentAllCallback.call(context, 4, allDone, 'oh noes an error', 'also has a result');
            });

            it('should update the context when it encounters the first error', function() {
                expect(context.numErrors).to.equal(1);
            });

            it('should increment the context numComplete', function() {
                expect(context.numComplete).to.equal(1);
            });

            it('should add the error to the correct position in the result array', function() {
                expect(context.results[4]).to.eql({
                    error: 'oh noes an error',
                    result: null
                });
            });
        });

        describe('final iteration invocation when errors have occurred', function() {
            beforeEach(function() {
                context.numComplete = 2;
                context.numToDo = 3;
                context.numErrors = 1;
                ConcurrentAll._concurrentAllCallback.call(context, 2, allDone, null, 'also has a result');
            });

            it('should bind expected null, numErrors and the results array to the allDone callback', function() {
                expect(allDone.bind.args[0]).to.eql([
                    null,
                    1,
                    context.results
                ]);
            });

            it('should call allDone.bind only once', function() {
                expect(allDone.bind.callCount).to.equal(1);
            });

            it('should provide invoke process.nextTick with the bound allDone callback', function() {
                expect(nextTickStub.args[0]).to.eql(['result of allDone.bind']);
            });
        });

        describe('final iteration invocation when no errors have occurred', function() {
            beforeEach(function() {
                context.numComplete = 2;
                context.numToDo = 3;
                context.numErrors = 0;
                ConcurrentAll._concurrentAllCallback.call(context, 2, allDone, null, 'also has a result');
            });

            it('should bind expected null, numErrors and the results array to the allDone callback', function() {
                expect(allDone.bind.args[0]).to.eql([
                    null,
                    null,
                    context.results
                ]);
            });

            it('should call allDone.bind only once', function() {
                expect(allDone.bind.callCount).to.equal(1);
            });

            it('should provide invoke process.nextTick with the bound allDone callback', function() {
                expect(nextTickStub.args[0]).to.eql(['result of allDone.bind']);
            });
        });
    });
});
