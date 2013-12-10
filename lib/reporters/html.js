var cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path');

// our html reporter
module.exports = function(data) {
  var $ = cheerio.load(fs.readFileSync(
    path.join(__dirname, '..', '..', 'resources', 'coverage-template.html')));
  $('#stats .percentage').text('99%');
  return $.html();
};
