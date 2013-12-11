// For a test author to enable code covergage instrumentation,
// they make a single call
var ass = require('..').enable(__dirname + "/server.js");

var     cp = require('child_process'),
    should = require('should'),
        fs = require('fs');

describe('a test', function() {
  var kid, url;

  it('server should start up', function(done) {
    kid = cp.fork("./server.js", [], { stdio: 'inherit' });
    kid.on('message', function(msg) {
      (msg).should.be.type('object');
      (msg).should.have.property('url');
      url = msg.url;
      done && done(null);
      done = null;
    });
    kid.on('exit', function() {
      done && done("unexpected exit");
      done = null;
    });
  });

  it('server should shut down', function(done) {
    kid.kill();
    kid.on('exit', function(code, signal) {
      var err = (code !== 0) ? "non-zero exit code: " + code : null;
      done(err);
    });
  });

  it('should aggregate coverage data', function(done) {
    // at the end of a test run, we can trigger a report.  This will
    // automatically cause all coverage data from all children processes
    // to be aggregated into a the report
    ass.report('json', function(err, r) {
      console.log("code coverage:", r.percent + "%");
      ass.report('html', function(err, r) {
        fs.writeFileSync('coverage.html', r);
        done(err);
      });
    });
  });
});
