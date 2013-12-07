// extract coverage data from the _$jscoverage global, and serialize it into
// a simple json format.
module.exports = function() {
  var jscoverage = global._$jscoverage;
  var a = [];

  if (jscoverage) {
    Object.keys(jscoverage).forEach(function(file) {
      var o = {
        file: file,
        source: jscoverage[file].source,
        hits: [ ]
      }
      for (var i = 0; i < o.source.length; i++) {
        o.hits.push(jscoverage[file][i]);
      }
      a.push(o);
    });
  }

  return JSON.stringify(a, null, "  ");
};
