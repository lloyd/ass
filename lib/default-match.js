// the default function to determine whether to instrument a file.
// this function assumes that inside an instrumented module, relative
// file paths will be used that are outside the REQUIRE_PATH, and
// that those are precisely the interesting files to instrument.
// thus:
//   require('./config.js'); /* instrument me! */
//   require('request'); /* don't instrument me */
//
// Because blanket is built on require.extensions, and because require
// extensions does not provide raw require arguments to the extender,
// we have to do unnatural things to get this natural behavior.

var path = require('path');
// XXX: a better way to determine node module paths?  Is this windows safe?
var myPaths = require.main.paths.slice(0, require.main.paths.indexOf(path.join('/', 'node_modules')) + 1);

module.exports = function(filename) {
  var inc = true;
  myPaths.forEach(function(p) {
    if (filename.indexOf(p) === 0) inc = false;
  });
  return inc;
};
