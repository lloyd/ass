const envVar = "ASS_CODE_COVERAGE";

// basic idea:
//
// code coverage turned on with:
//   require('ass').enable();
//
// all spawned processes should:
//   require('ass');
//
// The parent may generate a report when tests are done:
//  require('ass').report('html', function(err, results) {
//    console.log(results);
//  });

// XXX: we should allow the caller to pass in a way to specify
// which source modules are to be instrumented.
module.exports.enable = function(match) {
  var temp  = require('temp'),
      path  = require('path'),
      fs    = require('fs');

  if (process.env[envVar]) {
    throw new Error("code coverage is already enabled");
  }

  // Note: code coverage support is indicated via a directory
  // specified in the environemnt (envVar at the top of this file).

  // convey the directory to child processes
  process.env[envVar] = temp.mkdirSync("ass-coverage-data");

  process.on('exit', function() {
    // XXX we should synchronously delete all of the .json files and
    // the coverage data directory.  temp has delete-on-exit functionality
    // but it's non-recursive.
  });

  // also for *this* process (the parent), we'll enable blanket
  // so that code coverage occurs here too.
  require('blanket')({ pattern: match });

  // once enabled, we have the ability to "collect" stats and merge them into the
  // parent's coverage state
  module.exports.collect = function collect(cb) {
    function mergeCovData(data) {
      if (!global) global = {};
      if (!global._$jscoverage) global._$jscoverage = {};
      data.forEach(function(fdata) {
        if (!global._$jscoverage[fdata.file]) {
          global._$jscoverage[fdata.file] = [];
        }
        var tgt = global._$jscoverage[fdata.file];
        if (!tgt.source) {
          tgt.source = fdata.source;
        }
        for (var i = 0; i < tgt.source.length; i++) {
          if (typeof fdata.hits[i] === 'number') {
            tgt[i] = (tgt[i] || 0) + fdata.hits[i];
          } else {
            tgt[i] = undefined;
          }
        }
      });
    }

    fs.readdir(process.env[envVar], function(err, files) {
      files.filter(function(file) { return /\.json$/.test(file); }).forEach(function(f) {
        var p = path.join(process.env[envVar], f);
        var data = JSON.parse(fs.readFileSync(p));
        fs.unlink(p);
        mergeCovData(data);
      });
      cb();
    });
  }

  module.exports.report = function(format, cb) {
    this.collect(function(err) {
      if (err) {
        return cb(err);
      }

      try {
        var reporter = require(path.join(__dirname, 'lib', 'reporters', format));
      } catch(e) {
        throw new Error('No such format: ' + format);
      }

      cb(err, reporter(global._$jscoverage));
    });
  };

  return this;
};

// when ass is required and envVar is defined, this is a child process,
// we must enable blanket and write out coverage data on exit
if (process.env[envVar]) {
  var fs = require('fs'),
      path = require('path'),
      util = require('util');

  // XXX: we must figure out how to determine which files to instrument in the child
  // process
  function pattern(f) {
    return /server.js$/.test(f);
  }

  require('blanket')({ pattern: pattern });  // XXX: select which source to analyze

  process.on('exit', function() {
    var jsonCovData = require('./lib/serialize.js')();

    // now write synchronously (we're at exit and cannot use async code because
    // "The main event loop will no longer be run after the 'exit' callback")
    var tgt = path.join(process.env[envVar], util.format("%d.json", process.pid));
    fs.writeFileSync(tgt, jsonCovData);
  });
}
