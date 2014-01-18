var badge = require('gh-badges');

module.exports = function(data, cb) {
  var hit = 0,
      miss = 0;
  Object.keys(data).forEach(function(f) {
    for (var i = 0; i < data[f].length; i++) {
      if (data[f][i] !== undefined) {
        if (data[f][i]) {
          hit++;
        } else {
          miss++;
        }
      }
    }
  });
  var score = ((hit / (hit + miss)) * 100)|0;
  var badgeData = {text:['coverage', score + '%']};
  if (score < 70) {
    badgeData.colorscheme = 'red';
  } else if (score < 80) {
    badgeData.colorscheme = 'yellow';
  } else if (score < 90) {
    badgeData.colorscheme = 'yellowgreen';
  } else if (score < 100) {
    badgeData.colorscheme = 'green';
  } else {
    badgeData.colorscheme = 'brightgreen';
  }
  badge(badgeData, cb);
};
