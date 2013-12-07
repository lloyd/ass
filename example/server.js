require('..');

var app = require('express')();
var server = require('http').createServer(app);

app.get('/hello', function(req, res){
  res.send('Hello World');
});

app.get('/goodbye', function(req, res){
  res.send('Goodbye Cruel World');
});

server.listen(0, '127.0.0.1', function() {
  var url = 'http://' + server.address().address + ":" + server.address().port;
  process.send({ url: url });
});

process.on('SIGTERM', function() {
  server.close();
});
