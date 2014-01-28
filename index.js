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

module.exports.enable = function(options) {
  var temp  = require('temp'),
      path  = require('path'),
      fs    = require('fs');

  if (!options) {
    options = {};
  }

  if (process.env[envVar]) {
    throw new Error("code coverage is already enabled");
  }

  // Note: code coverage support is indicated via a directory
  // specified in the environment (envVar at the top of this file).

  // convey the directory to child processes
  var context = {
    dir: temp.mkdirSync("ass-coverage-data")
  };
  if (options.exclude) {
    context.exclude = options.exclude;
  }

  // pass context to child processes
  process.env[envVar] = JSON.stringify(context);

  process.on('exit', function() {
    try {
      // synchronously delete all data files at process exit.
      fs.readdirSync(context.dir).forEach(function(f) {
        if (f.indexOf('.') !== 0) {
          fs.unlink(f);
        }
      });
      fs.rmdirSync(context.dir);
    } catch(e) {
      // can't clean up our mess!  oh well.
    }
  });

  // also for *this* process (the parent), we'll enable blanket
  // so that code coverage occurs here too.
  require('blanket')({
    pattern: require('./lib/default-match'),
    'data-cover-never': options.exclude
  });

  // once enabled, we have the ability to "collect" stats and merge them into the
  // parent's coverage state
  var collecting = null;
  module.exports.collect = function collect(cb) {
    // ensure there's only one collection process running at a time
    if (collecting) {
      collecting.push(cb);
      return;
    } else {
      collecting = [ cb ];
    }

    if (!global._$jscoverage) {
      global._$jscoverage = {};
    }

    function mergeCovData(data) {
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

    fs.readdir(context.dir, function(err, files) {
      files.filter(function(file) {
        return (/\.json$/).test(file);
      }).forEach(function(f) {
        var p = path.join(context.dir, f);
        var data = JSON.parse(fs.readFileSync(p));
        fs.unlink(p);
        mergeCovData(data);
      });
      var callbacks = collecting;
      collecting = null;
      callbacks.forEach(function(cb) {
        cb(null);
      });
    });
  };

  module.exports.report = function(format, cb) {
    this.collect(function(err) {
      if (err) {
        return cb(err);
      }

      var reporter;
      try {
        reporter = require(path.join(__dirname, 'lib', 'reporters', format));
      } catch(e) {
        throw new Error('No such format: ' + format + ": " + e);
      }

      reporter(global._$jscoverage, function(res) {
        cb(err, res);
      });
    });
  };

  return this;
};

// when ass is required and envVar is defined, this is a child process,
// we must enable blanket and write out coverage data on exit
if (process.env[envVar]) {
  var context = JSON.parse(process.env[envVar]);

  var fs = require('fs'),
      path = require('path'),
      util = require('util');

  require('blanket')({
    pattern: require('./lib/default-match'),
    'data-cover-never': context.exclude
  });

  process.on('exit', function() {
    var jsonCovData = require('./lib/serialize.js')();

    // now write synchronously (we're at exit and cannot use async code because
    // "The main event loop will no longer be run after the 'exit' callback")
    var tgt = path.join(context.dir, util.format("%d.json", process.pid));
    fs.writeFileSync(tgt, jsonCovData);
  });
}
