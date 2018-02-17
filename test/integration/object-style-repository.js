'use strict';

const InstanceStyleRepository = require('./instance-style-repository.js');
const repository = new InstanceStyleRepository();

let objectStyleRepository;

module.exports = objectStyleRepository = {

    get(key, callback) {
        objectStyleRepository._get(key, callback);
    },

    set(key, value, callback) {
        objectStyleRepository._set(key, value, callback);
    },

    _get(key, callback) {
        repository.get(key, callback);
    },

    _set(key, value, callback) {
        repository.get(key, value, callback);
    }
};
