
// 为兼容更低版本的 node 所以才写成这样。。。
var napa = require('napajs')

function warp(zone) {
  return ({
    zone: zone,
    broadcast: function broadcast(name, args) {
      var code = name + '('
        + (args ? args.map(function (arg) { return JSON.stringify(arg) }) : '')
        + ');';
      return zone.broadcast(code);
    },
    execute: function execute(name, args) {
      return new Promise(function (resolve, reject) {
        zone.execute(function (_name, _args) {
          var __args = _args ? _args : [];
          return global[_name].apply(undefined, _args);
        }, [name, args]).then(function (result) {
          resolve(result.value)
        }).catch(reject);
      });
    }
  })
}

function load(id, module_path, _opts) {
  var opts = _opts || {};
  var code
    = "eval((function () {"
    + "  var bootstrap_module_path = " + JSON.stringify(module_path) + ";"
    + "  var bootstrap_module = require(bootstrap_module_path);"
    + "  var broadcast = bootstrap_module.__broadcast__ || [];"
    + "  var bootstrap_code = '';"
    + "  for (var export_func_name in bootstrap_module) {"
    + "    if (bootstrap_module.hasOwnProperty(export_func_name)"
    + "      && typeof bootstrap_module[export_func_name] === 'function') {"
    + "      bootstrap_code += 'function ' + export_func_name + '() { return require('"
    + "        + JSON.stringify(bootstrap_module_path) + ')['"
    + "        + JSON.stringify(export_func_name) + '].apply(undefined, arguments); };\\n';"
    + "    }"
    + "  }"
    + "  return bootstrap_code"
    + "})())"
    ;

  var zone = napa.zone.create(id, opts);
  return new Promise(function (resolve, reject) {
    zone.broadcast(code)
      .then(function () {
        resolve(warp(zone))
      }).catch(reject)
  });
}

exports.load = load
exports.warp = warp