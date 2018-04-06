
const assert = require('assert')
const { load } = require('../index')
const path = require('path')

async function __main__() {
    // 装在模块
    const zone = await load('test-module', path.join(__dirname, './test-module'))

    // 测试 execute 方法
    assert.strictEqual(await zone.execute('getState'), 'init')

    // 测试 broadcast 方法
    await zone.broadcast('changeState', ['changed'])
    assert.strictEqual(await zone.execute('getState'), 'changed')

    // 测试复杂状态
    const complex_state = { aaa: 'bbb', ccc: 'ddd', eee: [1, 2, 3, 'adf'], asd: null, xvd: { v2: 123 } }
    await zone.broadcast('changeState', [complex_state])
    assert.deepStrictEqual(await zone.execute('getState'), complex_state)

    // 测试运算
    assert.strictEqual(await zone.execute('fib', [40]), 102334155)

    console.log('All test case accessed!')
}

__main__()