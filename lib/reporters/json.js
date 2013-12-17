// json reporter for now simply reports coverage %age
module.exports = function(data) {
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
  var p = ((hit / (hit + miss)) * 100).toFixed(1);

  return {
    percent: p,
    hit: hit,
    miss: miss,
    sloc: hit + miss
  };
};
