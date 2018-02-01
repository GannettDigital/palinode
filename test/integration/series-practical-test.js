'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('series', function() {

    describe('task in the middle fails, each passing a parameter to the next', function() {
        function task0(callback) {
            setTimeout(() => callback(null, 10), 250);
        }

        function task1(resultOfTask0, callback) {
            setTimeout(() => callback(`pretend error object ${resultOfTask0}`), 250);
        }

        function task2(resultOfTask1, callback) {
            setTimeout(() => callback(null, resultOfTask1 / 2), 250);
        }

        let callbackSpy;
        let tasks;
        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const Series = require('../../lib/series.js');

            tasks = [
                sinon.spy(task0),
                sinon.spy(task1),
                sinon.spy(task2)
            ];
            Series.series(tasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should call the first two tasks once, and the third 0 times', function() {
            const callCounts = tasks.map((task) => task.callCount);
            expect(callCounts).to.eql([1, 1, 0]);
        });

        it('should call task0 once, with no parameters', function() {
            expect(tasks[0].calledWithExactly(sinon.match.func)).to.equal(true);
        });

        it('should call task1 with the result of task0', function() {
            expect(tasks[1].calledWithExactly(10, sinon.match.func)).to.equal(true);
        });

        it('should call task2 with the result of task1', function() {
            expect(tasks[2].notCalled).to.equal(true);
        });

        it('should call task0 before task1', function() {
            expect(tasks[0].calledBefore(tasks[1])).to.equal(true);
        });

        it('should call task1 before task2', function(){
            expect(tasks[1].calledBefore(tasks[2])).to.equal(true);
        });

        it('should call task1 before the callback', function(){
            expect(tasks[1].calledBefore(callbackSpy)).to.equal(true);
        });

        it('should call the callback with error from the second task', function() {
            expect(callbackSpy.args).to.eql([
                ['pretend error object 10']
            ]);
        });
    });

    describe('all tasks succeed, each passing a parameter to the next', function() {
        function task0(callback) {
            setTimeout(() => callback(null, 10), 250);
        }

        function task1(resultOfTask0, callback) {
            setTimeout(() => callback(null, resultOfTask0 * 14), 250);
        }

        function task2(resultOfTask1, callback) {
            setTimeout(() => callback(null, resultOfTask1 / 2), 250);
        }

        let callbackSpy;
        let tasks;
        before('run test', function(done) {
            mockery.enable({useCleanCache: true, warnOnUnregistered: false});

            const Series = require('../../lib/series.js');

            tasks = [
                sinon.spy(task0),
                sinon.spy(task1),
                sinon.spy(task2)
            ];
            Series.series(tasks, callbackSpy = sinon.spy(() => done()));
        });

        after(function() {
            mockery.disable();
        });

        it('should should call each task once', function() {
            const callCounts = tasks.map((task) => task.callCount);
            expect(callCounts).to.eql([1, 1, 1]);
        });

        it('should call task0 once, with no parameters', function() {
            expect(tasks[0].calledWithExactly(sinon.match.func)).to.equal(true);
        });

        it('should call task1 with the result of task0', function() {
            expect(tasks[1].calledWithExactly(10, sinon.match.func)).to.equal(true);
        });

        it('should call task2 with the result of task1', function() {
            expect(tasks[2].calledWithExactly(140, sinon.match.func)).to.equal(true);
        });

        it('should call task0 before task1', function() {
            expect(tasks[0].calledBefore(tasks[1])).to.equal(true);
        });

        it('should call task1 before task2', function(){
            expect(tasks[1].calledBefore(tasks[2])).to.equal(true);
        });

        it('should call task2 before the callback', function(){
            expect(tasks[2].calledBefore(callbackSpy)).to.equal(true);
        });

        it('should call the callback with the null for error and the result of the series', function() {
            expect(callbackSpy.args).to.eql([
                [null, 70]
            ]);
        });
    });

});

