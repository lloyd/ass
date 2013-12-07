// json reporter for now simply reports coverage %age
module.exports = function(data) {
  var tot = 0,
      covered = 0;

  Object.keys(data).forEach(function(f) {
    for (var i = 0; i < data[f].length; i++) {
      if (data[f][i] !== undefined) {
        tot++
        if (data[f][i]) covered++;
      }
    }
  });
  var p = ((covered / tot) * 100).toFixed(1);
  return { percent: p };
};
