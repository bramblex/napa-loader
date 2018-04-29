
const assert = require('assert')
const { load, zrequire } = require('../index')
const path = require('path')

async function __main__() {

    // load an custom module
    const test_module_sync = require('./test-module')
    const test_module_async = await zrequire('./test-module', { broadcast_funcs: ['changeState'] })

    // test module cache
    assert(test_module_async === await zrequire('../test/test-module'))

    // test if all functions auto exported
    assert.deepStrictEqual(
        Object.keys(test_module_sync).filter(name => typeof test_module_sync[name] === 'function'),
        Object.keys(test_module_async).filter(name => name !== '__zone__')
    )

    // test exported function
    assert.strictEqual(test_module_sync.fib(10), await test_module_async.fib(10))

    // test multi args
    assert.deepStrictEqual(test_module_sync.fib2(10, 12), await test_module_async.fib2(10, 12))

    // test 
    assert.strictEqual(test_module_sync.getState(), await test_module_async.getState())
    const state = { asf: 23324, waef: { asdf: true }, vcejk: null }
    test_module_async.changeState(state)
    assert.deepStrictEqual(state, await test_module_async.getState())

    // Load an third-party modules module，such as Lodash
    const lodash_sync = require('lodash')
    const lodash_async = await zrequire('lodash')

    // test module cache
    assert(lodash_async === await zrequire('lodash'))

    // test if all functions auto exported from lodash
    assert.deepStrictEqual(
        Object.keys(lodash_sync).filter(name => typeof lodash_sync[name] === 'function'),
        Object.keys(lodash_async).filter(name => name !== '__zone__')
    )

    // test lodash
    const test_data = [1,2,3,4,5,6,7,8,9,10]
    assert.deepStrictEqual(lodash_sync.chunk(test_data), await lodash_async.chunk(test_data))

    console.log('All test cases passed')
}

__main__()