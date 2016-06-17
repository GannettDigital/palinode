# palinode
NodeJS callback-based flow control utility library

## Installation
```Shell
npm set registry http://presto-sinopia.awsdev.usatoday.com
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

Just require `palinode` 

## Supported methods

### Series
Runs a series of functions.  Each function calls back to the next. Any parameters passed to a callback are spread into the subsequent function call.
All functions in a series should accept a callback in the form:
```
function(error, param1[, param2, param3...]) {}
```
Example usage
```
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

