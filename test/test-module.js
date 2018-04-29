
let state = 'init'

function changeState(_state) {
    state = _state
}

function getState() {
    return state
}

function fib(n) {
    if (n === 0) return 0;
    else if (n === 1) return 1;
    else return fib(n - 1) + fib(n - 2)
}

function fib2(n1, n2) {
    return [fib(n1), fib(n2)]
}

module.exports = { fib, changeState, getState, fib2 }
