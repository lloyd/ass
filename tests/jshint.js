/* global describe,it */

const
should = require('should'),
fs = require('fs'),
path = require('path'),
jshint = require('jshint').JSHINT,
walk = require('walk'),
async = require('async'),
util = require('util');

describe('source code syntax', function() {
  // read jshintrc
  var jshintrc;

  it('.jshintrc should be readable', function(done) {
    jshintrc = JSON.parse(fs.readFileSync(path.join(__dirname, '../.jshintrc')).toString());
    (jshintrc).should.be.type('object');
    done();
  });

  var filesToLint = [
    path.join(__dirname, '..', 'index.js')
  ];

  it('we should be able to discover files to lint', function(done) {
    async.each([
      path.join(__dirname, '../lib'),
      __dirname
    ], function(dir, done) {
      var walker = walk.walk(dir, {});

      walker.on("file", function(root, fStat, next) {
        var f = path.join(root, fStat.name);
        if (/\.js$/.test(f)) {
          filesToLint.push(f);
        }
        next();
      });
      walker.on("end", done);
    }, done);
  });

  it('syntax checking should yield no errors', function(done) {
    var errors = [];

    function checkNext() {
      if (!filesToLint.length) {
        if (errors.length) {
          var buf = util.format("\n        %d errors:\n        * ",
                                errors.length);
          buf += errors.join("\n        * ");
          done(buf);
        } else {
          done(null);
        }
        return;
      }
      var f = filesToLint.shift();
      fs.readFile(f.toString(), function(err, data) {
        should.not.exist(err);
        f = path.relative(process.cwd(), f);
        if (!jshint(data.toString(), jshintrc)) {
          jshint.errors.forEach(function(e) {
            errors.push(util.format("%s %s:%d - %s", e.id, f, e.line, e.reason));
          });
        }
        checkNext();
      });
    }
    checkNext();
  });
});
