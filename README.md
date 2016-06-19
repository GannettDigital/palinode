# palinode
NodeJS callback-based flow control utility library.  Palinode focuses on a pure, dependency free, no-frills, native javascript implementation.  Palinode is intentionally not compatible with browsers; it is intended for NodeJS only.

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

## Supported methods

### Series
Runs a series of functions.  Each function calls back to the next. Any parameters passed to a callback are spread into the subsequent function call. 
The provided array of functions is not mutated.
All functions in a series should accept a callback in the form:
```Javascript
function(error, param1[, param2, param3...]) {}
```
Example usage
```Javascript
var series = require('palinode').series;

var numToAddEachTime = 5;
function add(a, b, callback) {
    if (a < 0) {
        callback(new Error('a cannot be less than zero'));
    }
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
}
```
### Map Each
Runs a single function against each member of an array, invoking a callback when complete of if an error occurs during execution.  If successful for each item in the input array, the result provided to the callback will be a new array containing the mapped values.
The input array is not mutated.
Example usage
```Javascript
var mapEach = require('palinode').mapEach;
var inputArray = [1,2,3,4,5,6,7,8,9,10];

functon square(input, callback) {
    return callback(null, input * input);
}

mapEach(inputArray, square, function(error, result) {
    console.log(result);
    //outputs: [1,4,9,16,25,36,49,64,81,100]
});

```
