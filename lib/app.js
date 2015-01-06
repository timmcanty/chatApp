
var http = require('http');
var static = require('node-static');
var chatServer = require('./chat_server');
console.log(chatServer);


var file = new static.Server('./public');

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

chatServer.createChat(server);


server.listen(3000);
