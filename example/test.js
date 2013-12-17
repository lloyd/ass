// For a test author to enable code covergage instrumentation,
// they make a single call
var ass = require('..').enable(__dirname + "/server.js");

var     cp = require('child_process'),
    should = require('should'),
        fs = require('fs'),
   request = require('request');

describe('a test', function() {
  var kid, url;

  it('server should start up', function(done) {
    kid = cp.fork("./stub.js", [], { stdio: 'inherit' });
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

  it('server should respond to hello', function(done) {
    request(url + '/hello', function(error, response, body) {
      should.not.exist(error);
      (response.statusCode).should.equal(200);
      (body).should.equal('Hello World');
      done();
    });
  });


  it('server should shut down', function(done) {
    kid.kill();
    kid.on('exit', function(code, signal) {
      var err = (code !== 0) ? "non-zero exit code: " + code : null;
      done(err);
    });
  });

  it('code coverage should exceed 90%', function(done) {
    ass.report('json', function(err, r) {
      (r.percent).should.be.above(80.0);
      done(err);
    });
  });

  it('coverage.html should be written', function(done) {
    ass.report('html', function(err, r) {
      try {
        fs.writeFileSync('coverage.html', r);
      } catch (e) {
        if (!err) err = e;
      }
      done(err);
    });
  });
});
