const envVar = "ASS_CODE_COVERAGE";

// ass code coverage is enabled by:
//   require('ass').enable();

// XXX: we should allow the caller to pass in a way to specify
// which source modules are to be instrumented.
module.exports.enable = function() {
  var temp  = require('temp'),
      path  = require('path'),
      fs    = require('fs');

  if (process.env[envVar]) {
    throw new Error("code coverage is already enabled");
  }

  // Note: code coverage support is indicated via a directory
  // specified in the environemnt (envVar at the top of this file).

  // convey the directory to child processes
  // XXX: currently we store in a temp directory, but we could change
  // this...
  process.env[envVar] = temp.mkdirSync("ass-coverage-data");

  process.on('exit', function() {
    // XXX we should synchronously delete all of the .json files and
    // the coverage data directory.  temp has delete-on-exit functionality
    // but it's non-recursive.
  });

  // also for *this* process (the parent), we'll enable blanket
  // so that code coverage occurs here too.
  require('blanket');
};

// when ass is required and envVar is defined, this is a child process,
// we must enable blanket and write out coverage data on exit
if (process.env[envVar]) {
  require('blanket');

  process.on('exit', function() {
    var jsonCovData = require('./lib/serialize.js')();

    // now write synchronously (we're at exit and cannot use async code because
    // "The main event loop will no longer be run after the 'exit' callback")
    fs.writeFileSync(path.join(process.env[envVar],
                               util.format("%d.json", process.pid)),
                     jsonCovData);
  });
}
