
var napa = require('napajs')
var path = require('path')
var fs = require('fs')
var callsites = require('callsites')

// warp a napajs zone
function zwarp(zone) {
  return ({
    zone: zone,
    broadcast: function broadcast(name, args) {
      var code = name + '('
        + (args ? args.map(function (arg) { return JSON.stringify(arg) }).join(', ') : '')
        + ');';
      return zone.broadcast(code);
    },
    execute: function execute(name, args) {
      return new Promise(function (resolve, reject) {
        zone.execute(function (_name, _args) {
          var __args = _args ? _args : [];
          return global[_name].apply(undefined, __args);
        }, [name, args]).then(function (result) {
          resolve(result.value)
        }).catch(reject);
      });
    }
  })
}

// load an module and wrapped by zwrap
function zload(id, module_path, _opts) {

  var opts = _opts || {};
  var code
    = "eval((function () {"
    + "  var bootstrap_module_path = " + JSON.stringify(module_path) + ";"
    + "  var bootstrap_module;"

    // get information when cashed
    + "  try { bootstrap_module = require(bootstrap_module_path); } "
    + "  catch(err) {  bootstrap_module = { __error__: function() { return JSON.stringify(err); } } }" 

    + "  var bootstrap_code = '';"
    + "  var func_names = [];"
    + "  for (var export_func_name in bootstrap_module) {"
    + "    if (bootstrap_module.hasOwnProperty(export_func_name)"
    + "      && typeof bootstrap_module[export_func_name] === 'function') {"
    + "      func_names.push(export_func_name);"
    + "      bootstrap_code += 'function ' + export_func_name + '() { return require('"
    + "        + JSON.stringify(bootstrap_module_path) + ')['"
    + "        + JSON.stringify(export_func_name) + '].apply(undefined, arguments); };\\n';"
    + "    }"
    + "  }"

    // add an "__names__" function to get all exported function names
    + "  bootstrap_code += 'function __names__() { return ' + JSON.stringify(func_names) + ';} ';"

    + "  return bootstrap_code"
    + "})())"
    ;

  var zone = napa.zone.create(id, opts);
  return new Promise(function (resolve, reject) {
    var warped_zone;

    // run code
    zone.broadcast(code)
      .then(function () {
        warped_zone = zwarp(zone);
        return warped_zone.execute('__names__');
      })
      .then(function(names){
        // check no error
        if (names.indexOf('__error__') >= 0) {
          warped_zone.execute('__error__').then(reject);
        } else {
          resolve(warped_zone);
        }
      })
      .catch(reject);
  });
}

var cache = {}

function zrequire(_module_path, _opts) {
  var opts = Object.assign({ broadcast_funcs: [], }, _opts || {});
  var broadcast_funcs = opts.broadcast_funcs;
  delete opts.broadcast_funcs;

  // parse module_path
  var module_path;
  if (path.isAbsolute(_module_path) || _module_path[0] !== '.') {
    module_path = _module_path;
  } else {
    var caller_path = callsites()[1].getFileName()
    module_path = path.join(path.dirname(caller_path), _module_path);
  }

  // cache module
  if (cache[module_path]) {
    return Promise.resolve(cache[module_path]);
  }
  
  return new Promise(function (resolve, reject) {
    var zone;
    zload(module_path, module_path, opts)
      .then(function (_zone) {
        zone = _zone;
        return zone.execute('__names__');
      })
      .then(function (func_names) {
        var zone_module = {};
        zone_module.__zone__ = zone;

        // create module interface
        func_names.forEach(function (name) {
          if (broadcast_funcs.indexOf(name) >= 0) {
            zone_module[name] = function () {
              var args = Array.prototype.slice.apply(arguments);
              return zone.broadcast(name, args);
            }
          } else {
            zone_module[name] = function () {
              var args = Array.prototype.slice.apply(arguments);
              return zone.execute(name, args);
            } }
        });

        cache[module_path] = zone_module;
        resolve(zone_module);
      })
      .catch(reject);
  });
}

// for compatible with version 1.0
exports.load = zload
exports.warp = zwarp

// export functions
exports.zload = zload
exports.zwarp = zwarp
exports.zrequire = zrequire