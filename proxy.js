var rh = require('./request-helper');
var http = require('http');

var requestHelper = new rh();
var server = http.createServer();

server.on('request', function(request, response) {

  if (!requestHelper.isHostAllowed(request.url)) {
    var forbidden = requestHelper.forbidden();
    response.writeHead(forbidden['status-code'], forbidden['headers']);
    response.end(forbidden['html-answer'], forbidden['encoding']);
    return;
  }

  var data = '';
  var options = requestHelper.requestOptions(request);
  
  console.log(`Request hostname: ${request.url}`);

  var requestClient = http.request(options, (result) => {
    var encoding = requestHelper.contentEncoding(result.rawHeaders);
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
