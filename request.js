var http = require('http');
var url = require('url');

var server = http.createServer();

server.on('request', function(request, response) {
  var options = {
    hostname: 'my-shop.ru',
    port: 80,
    path: '/',
    method: 'GET',
    headers: request.headers.toString()
  };

  var requestClient = http.request(options, (result) => {
    result.setEncoding('utf8');

    result.on('data', (chunk) => {
      console.log(chunk);
    });

    result.on('end', () => {
      console.log("End of request/response.");
    });
  });

  requestClient.on('error', (error) => {
    console.log(error);
  });

  requestClient.end();
});

server.listen(8080);
console.log('Listen 127.0.0.1:8080');
