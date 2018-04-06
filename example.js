
const path = require('path')
const napa = require('napajs')
const { load, warp } = require('./index')

async function __main__() { 

    // 用 load(id, module_path, zone_setting) 加载启动模块
    const zone1 = await load(
        'test-load', 
        path.join(__dirname, '/test/test-module'), 
        { workers: 4 }
    )

    // 用 zone.execute(name, args?) 来调用方法
    console.log(await zone1.execute('fib', [40]))

    // 用 zone.broadcast(name, args?) 来调用会改变状态的方法
    console.log(await zone1.execute('getState'))
    await zone1.broadcast('changeState', ['changed'])
    console.log(await zone1.execute('getState'))

    // 用 warp 来封装现成的 zone
    const _z2 = napa.zone.create('test-warp')
    await _z2.broadcast(`
        function fib(n) {
            if (n === 0) return 0;
            else if (n === 1) return 1;
            else return fib(n - 1) + fib(n - 2)
        }
    `)

    // 用 warp 来 包装
    const zone2 = warp(_z2)
    console.log(await zone2.execute('fib', [40]))
}

__main__()