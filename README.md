# palinode
NodeJS callback-based flow control utility library.  Palinode focuses on a pure, dependency free, no-frills, native javascript implementation.  Palinode is intentionally not compatible with browsers; it is intended for NodeJS only.

[![npm version](https://badge.fury.io/js/palinode.svg)](https://badge.fury.io/js/palinode)
[![Build Status](https://travis-ci.org/GannettDigital/palinode.svg?branch=master)](https://travis-ci.org/GannettDigital/palinode)  [![Coverage Status](https://coveralls.io/repos/github/GannettDigital/palinode/badge.svg?branch=master)](https://coveralls.io/github/GannettDigital/palinode?branch=master)

palinode (noun): a poem in which the poet retracts a view or sentiment expressed in a former poem. - source: Google. 

## Installation
```Shell
npm install palinode
```

## Test 
```Shell
npm run test
```

## Coverage
```Shell
npm run cover-html
```

## Setup
```Javascript
var theFunctionToUse = require(`palinode`).theFunctionYouWant
```

## Callback Pattern Expectations
As with the vast majority of native node libraries, all callbacks are by convention expected to be in the form:
```Javascript
function(error [, param1, param2, param3...]) {}
```
- A callback invoked with a falsy value in the 0th parameter position indicates that caller was successful.
- A callback invoked with a truthy value in the 0th parameter position indicates the error encountered by the caller.
- As a best practice, errors provided as the 0th parameter should be an instance of the `Error` prototype.
- Parameters in the 1st-nth positions contain successful response information, if any. 

## Supported methods

### Series
Runs a series of functions.  Each function calls back to the next. Any parameters passed to a callback are spread into the subsequent function call. 
The provided array of functions is not mutated.

#### Example usage
```Javascript
var series = require('palinode').series;

var numToAddEachTime = 5;
function add(a, b, callback) {
    callback(null, a + b, numToAddEachTime);
}

var functions = [
    add.bind(null, 0, 0),
    add,
    add,
    add
];

series(functions, function(error, result) {
    console.log(result);
    //outputs: 15
});
```

### Map Each
Runs a single function against each member of an array, invoking a callback when complete or when an error occurs during execution.  If successful for each item in the input array, the result provided to the callback will be a new array containing the mapped values. If an error occurs, no data will be returned in the callback result.
The input array is not mutated.

#### Example usage
```Javascript
var mapEach = require('palinode').mapEach;
var inputArray = [1,2,3,4,5,6,7,8,9,10];

function square(input, callback) {
    return callback(null, input * input);
}

mapEach(inputArray, square, function(error, result) {
    console.log(result);
    //outputs: [1,4,9,16,25,36,49,64,81,100]
});

```

### Concurrent
- Schedules each function to be executed on the next tick.
- Invokes a callback when all have been successful, of if any function calls back with error.  
- If any error occurs, all outstanding callbacks will have no effect. 
- If any error occurs, the result will be undefined - partial results are not provided
- Results are accumulated into an array, where the position of each result corresponds to the position of the function.
- The array of task functions is not mutated.

#### Input function callback expectations
All functions are expected to accept a callback in the form:
```Javascript
function(error, result) {}
```
Any parameters passed after `result` are ignored.

#### Example usage
```Javascript
var concurrent = require('palinode').concurrent;

function taskOfRandomDuration(number, callback) {
    setTimeout(function() {
        callback(null, number * number);
    }, Math.floor((Math.random() * 3000) + 250));
}

var tasks = [
    taskOfRandomDuration.bind(null, 2),
    taskOfRandomDuration.bind(null, 4),
    taskOfRandomDuration.bind(null, 8),
];

concurrent(tasks, function(err, res) {
    console.log(res);
    //outputs: [4, 16, 64]
});
```

### MapConcurrent
- Binds each input item to the provided function.
- Schedules all bound functions to be executed on next tick. 
- Calls the callback when all functions have completed, or if any callback with error.  
- If any error occurs, all outstanding callbacks will have no effect.
- If any error occurs, the result will be undefined - partial results are not provided
- Results are accumulated into an array, where the position of each result corresponds to the position of the input item.
- Does not mutate the input array

#### Function expectations
The function to run is expected to have a signature:
```Javascript
function(inputItem, callback) {}
```
The function to run is expected to accept a callback in the form:
```Javascript
function(error, result) {}
```

#### Example usage
```Javascript
var mapConcurrent = require('palinode').mapConcurrent;

function squareWithDelay(number, callback) {
    setTimeout(function() {
        callback(null, number * number);
    }, Math.floor((Math.random() * 1500) + 150));
}

var inputItems = [1, 2, 3, 4, 5];

mapConcurrent(inputItems, task, function(err, res) {
    console.log(res);
    //outputs: [1, 4, 9, 16, 25]
});
```