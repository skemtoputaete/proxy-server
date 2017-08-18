var http = require('http');
var url = require('url');
var fs = require('fs');

var server = http.createServer();

server.on('request', function(request, response) {
  // response - экземпляр класса http.ServerResponse
  // request - экземпляр класса http.IncomingMessage

  var body = "";

  // Парсим запрашиваемый URL
  var requestUrl = url.parse(request.url, true);

  // Формируем необходимые данные для запроса
  var options = {
    hostname: requestUrl.hostname.toString(),
    port: requestUrl.port,
    path: requestUrl.path.toString(),
    method: request.method.toString(),
    headers: request.headers.toString()
  };

  // Выполняем запрос
  // requestClient - экземпляр класса http.ClientRequest
  var requestClient = http.request(options, (result) => {
    result.setEncoding('utf8');

    result.on('data', (chunk) => {
      body += chunk;
    });

    result.on('end', () => {
      console.log("End of request/response.");
      response.writeHead(result.statusCode, result.headers);
      response.end(body);
    });
  });

  requestClient.on('error', (error) => {
    console.log(error);
  });

  requestClient.end();
});

server.listen(8080);
console.log('Listen 127.0.0.1:8080');
