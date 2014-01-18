var cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path');

// our html reporter
module.exports = function(data, cb) {
  // let's write a looong function.

  // parse html for our template
  var $ = cheerio.load(fs.readFileSync(path.join(__dirname, '..', '..', 'resources', 'coverage-template.html')));

  // for each file, we'll make a files entry, and we'll collect cumulative
  // stats as we go
  var gHits = 0, gMisses = 0;

  // find the longest comment prefix for more terse reports
  function commonPrefix(elems) {
    if (elems.length === 0) {
      return 0;
    }
    if (elems.length === 1) {
      return elems[0].length - path.basename(elems[0]).length;
    }
    elems = elems.sort();
    var first = elems[0], last = elems[elems.length - 1], i = 0;
    while (first.charAt(i) === last.charAt(i)) {
      i++;
    }
    return i;
  }
  var pathOffset = commonPrefix(Object.keys(data));

  Object.keys(data).forEach(function(fileName) {
    var displayName = fileName.substr(pathOffset);
    var f = $('#files .file.template').clone();
    f.removeClass('template');
    f.find('h2').attr('id', displayName).text(displayName);

    var hits = 0,
      misses = 0;

    var srcTemplate = f.find('tr.template');
    for (var i = 1; i <= data[fileName].source.length; i++) {
      // and add the source line
      var s = srcTemplate.clone().removeClass('template');
      s.find('.line').text(i);
      s.find('.hits').text(data[fileName][i]);
      s.find('.source').text(data[fileName].source[i - 1]);

      if (data[fileName][i]) {
        s.addClass('hit');
        hits++;
      } else if (data[fileName][i] !== undefined) {
        s.addClass('miss');
        misses++;
      }

      f.find('#source tbody').append(s);
    }

    var pct = (100.0 * hits / (hits + misses));
    f.find('.stats .percentage').text(pct.toFixed(1) + '%');
    f.find('.stats .sloc').text(hits + misses);
    f.find('.stats .hits').text(hits);
    f.find('.stats .misses').text(misses);

    $('#files').append(f);

    // and an entry in the menu
    var m = $('#menu li.template').clone().removeClass('template');
    m.find('a').attr('href', '#' + displayName).text(displayName);
    m.find('.cov').text(pct.toFixed(0) + '%');
    $('#menu').append(m);

    // update global stats
    gHits += hits;
    gMisses += misses;
  });

  // global stats
  $('#stats .percentage').text((100.0 * gHits / (gHits + gMisses)).toFixed(1) + '%');
  $('#stats .sloc').text(gHits + gMisses);
  $('#stats .hits').text(gHits);
  $('#stats .misses').text(gMisses);

  cb($.html());
};
