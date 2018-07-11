'use strict';

const mockery = require('mockery');
const { expect } = require('chai');

describe('using concurrent', function() {

    beforeEach('init state', function() {
        mockery.enable({useCleanCache: true, warnOnUnregistered: false});
    });

    afterEach('reset state', function() {
        mockery.disable();
    });

    describe('invoking bound functions', function() {
        it('should have to bind an instance when using a instance function', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const Repository = require('./instance-style-repository.js');
            const repository = new Repository();

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => repository.set.bind(repository, `num_${number}`, number));

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => repository.get.bind(repository, `num_${number}`));

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });

        it('should not have to bind an instance when using an object method', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const repository = require('./object-style-repository.js');

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => repository.set.bind(null, `num_${number}`, number));

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => repository.get.bind(null, `num_${number}`));

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });
    });

    describe('when wrapping methods in anonymous arrow functions', function() {
        it('should not have to bind when wrapping instance methods', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const Repository = require('./instance-style-repository.js');
            const repository = new Repository();

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => (callback) => { repository.set(`num_${number}`, number, callback); });

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => (callback) => { repository.get(`num_${number}`, callback); });

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });

        it('should not have to bind when wrapping object methods', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const repository = require('./object-style-repository.js');

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => (callback) => { repository.set(`num_${number}`, number, callback); });

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => (callback) => { repository.get(`num_${number}`, callback); });

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });
    });

    describe('when wrapping methods in anonymous functions', function() {
        it('should not have to bind when wrapping instance methods', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const Repository = require('./instance-style-repository.js');
            const repository = new Repository();

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => function(callback) { repository.set(`num_${number}`, number, callback); });

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => function(callback) { repository.get(`num_${number}`, callback); });

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });

        it('should not have to bind when wrapping object methods', function(done) {
            const concurrent = require('../../index.js').concurrent;
            const repository = require('./object-style-repository.js');

            const numbersToStore = [1, 2, 3];
            const setFunctions = numbersToStore.map((number) => function(callback) { repository.set(`num_${number}`, number, callback); });

            concurrent(setFunctions, () => {
                const getFunctions = numbersToStore.map((number) => function(callback) { repository.get(`num_${number}`, callback); });

                concurrent(getFunctions, (error, results) => {
                    const theAnswer = results.map((result) => result.data);

                    expect(theAnswer).to.eql([1, 2, 3]);

                    done();
                });
            });
        });
    });
});
