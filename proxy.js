var rh = require('./rh');
var http = require('http');

var server = http.createServer();

server.on('request', function(request, response) {

  if (!rh.isHostAllowed(request.url)) {
    var forbidden = rh.forbidden();
    response.writeHead(forbidden['status-code'], forbidden['headers']);
    response.end(forbidden['html-answer'], forbidden['encoding']);
    return;
  }

  var data = '';
  var options = rh.requestOptions(request);

  console.log(`Request hostname: ${request.url}`);

  var requestClient = http.request(options, (result) => {
    var encoding = rh.contentEncoding(result.rawHeaders);
    result.setEncoding(encoding['incoming']);

    result.on('data', (chunk) => {
      data += chunk;
    });

    result.on('end', () => {
      console.log(`End of request/response with ${request.url}.`);
      response.writeHead(result.statusCode, result.headers);
      response.end(data, encoding['incoming']);
    });
  });

  requestClient.on('error', (error) => {
    console.log(error);
  });

  requestClient.end();
});

server.listen(8080);
console.log('Listen 127.0.0.1:8080');
