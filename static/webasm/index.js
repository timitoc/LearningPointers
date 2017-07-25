/*var static = require('node-static');
var file = new static.Server();
require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
}).listen(process.env.PORT || 3000);
*/

const express = require('express');

var app = express();

app.use(express.static(__dirname));

app.listen(process.env.PORT || 3001);
