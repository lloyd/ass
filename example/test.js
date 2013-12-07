var ass = require('..').enable(),
    cp = require('child_process'),
    should = require('should');

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
    ass.report('json', function(err, r) {
      console.log(err, r);
      done(err);
    });
  });
});
