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
  Object.keys(data).forEach(function(fileName) {
    var f = $('#files .file.template').clone();
    f.removeClass('template');
    $('h2').attr('id', fileName).text(fileName);

    var hits = 0,
      misses = 0;

    for (var i = 0; i < data[fileName].source.length; i++) {
      if (data[fileName][i] === undefined) continue;
      if (data[fileName][i]) hits++;
      else misses++;
    }
    $('.percentage').text((100.0 * hits / (hits + misses)).toFixed(1) + '%');
    $('.sloc').text(hits + misses);
    $('.hits').text(hits);
    $('.misses').text(misses);

    $('#files').append(f);
  });
  $('#stats .percentage').text('99%');
  return $.html();
};
