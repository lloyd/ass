status: **experimental** (there's no way this fragile approach will ever work, run away)

## **Ass**: Cross Process Code Coverage

`ass` is a small node.js code coverage library:

* **dynamic instrumentation**: no pre-compilation step required
* **minimal instrumentation**: add a couple lines and go
* **multiple process support**: coverage data from instrumented sub-processes will be aggregated into a single report
* **different report formats**: basic reporting functionality built in

## Theory

The philosophy behind `ass` is that implementing code coverage should
be a trivial process.  That no pre or post processing should be
required.  That the code coverage library should itself handle
reporting (not require support from your test framework).  That code
coverage data should be programatically accessible.

## Practice

To get started with ass, first install it:

    npm install --save-dev ass

Then instrument processes that are run by your test harness by adding a
single "stub" file (say your original server was in `server.js`, let's assume
you name the stub `stub.js`):

    require('ass');
    require('./server.js');

Finally, you can enable testing in your test harness programatically:

    var ass = require('ass').enable();

    // .. run all of your tests, spawning instrumented processes

    ass.report('html', function(err, report) {
      require('fs').writeFileSync('coverage.html', report);
    });

## Example

A full example of code coverage is available:

    $ git clone git://github.com/lloyd/ass
    $ cd ass/example
    $ npm install
    $ npm test
    $ open coverage.html

## License

MIT

## Credits

The design of the html reporter was lifted from [TJ Holowaychuk](https://twitter.com/tjholowaychuk)'s fantastic
[mocha test framework](http://visionmedia.github.io/mocha/).
