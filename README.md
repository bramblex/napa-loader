# Napa-Loader

## Install

```Bash
npm install --save napa-loader
```

## Usage

see [test](https://github.com/bramblex/napa-loader/blob/master/test/test.js)

### 1. Create a module

``` JavaScript
// test-module.js
let state = 'init'

function changeState(_state) { state = _state }

function getState() { return state }

function fib(n) {
    if (n === 0) return 0;
    else if (n === 1) return 1;
    else return fib(n - 1) + fib(n - 2)
}

module.exports = { fib, changeState, getState }
```

### 2. Load module by `zrequire(<module_path>)`

``` JavaScript

// Create a zone and init by load test-module.js
const test_module  = await zrequire('./test-module',  // same as require()
    { broadcast_funcs: ['changeState'] }) // mask 'changeState()' function will change environment and broadcast to all threads

// It is same as an normal module, but wrapped by Promise.
assert(await test_module.fib(40) === require('./test-module').fib(40))

// broadcast function can change all threads' environment
// note: broadcast function cannot return anything
await test_module.changeState('hello napajs')
assert(await test_module.getState() === 'hello napajs')

```