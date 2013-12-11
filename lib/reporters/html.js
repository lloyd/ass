var cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path');

// our html reporter
module.exports = function(data) {
  // let's write a looong function.

  // parse html for our template
  var $ = cheerio.load(fs.readFileSync(path.join(__dirname, '..', '..', 'resources', 'coverage-template.html')));

  // for each file, we'll make a files entry, and we'll collect cumulative
  // stats as we go
  var gHits = 0, gMisses = 0;

  Object.keys(data).forEach(function(fileName) {
    var f = $('#files .file.template').clone();
    f.removeClass('template');
    f.find('h2').attr('id', fileName).text(fileName);

    var hits = 0,
      misses = 0;

    for (var i = 0; i < data[fileName].source.length; i++) {
      if (data[fileName][i] === undefined) continue;
      if (data[fileName][i]) hits++;
      else misses++;
    }
    var pct = (100.0 * hits / (hits + misses));
    f.find('.percentage').text(pct.toFixed(1) + '%');
    f.find('.sloc').text(hits + misses);
    f.find('.hits').text(hits);
    f.find('.misses').text(misses);

    $('#files').append(f);

    // and an entry in the menu
    var m = $('#menu li.template').clone().removeClass('template');
    m.find('a').attr('href', '#' + fileName).text(fileName);
    m.find('.cov').text(pct.toFixed(0) + '%');
    $('#menu').append(m);

    gHits += hits;
    gMisses += misses;
  });

  // global stats
  $('#stats .percentage').text((100.0 * gHits / (gHits + gMisses)).toFixed(1) + '%');
  $('#stats .sloc').text(gHits + gMisses);
  $('#stats .hits').text(gHits);
  $('#stats .misses').text(gMisses);

  return $.html();
};
