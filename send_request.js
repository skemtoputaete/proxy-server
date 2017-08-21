var url = require('url');
var http = require('http');

var server = http.createServer();

server.on('request', function(request, response) {
  // response - экземпляр класса http.ServerResponse
  // request - экземпляр класса http.IncomingMessage

  var denyHosts = ['gipnomag.ru', 'mychell.ru', 'manystars.ru', 'opentests.ru', 'amur-bereg.ru'];

  var body = "";

  // Парсим запрашиваемый URL
  var requestUrl = url.parse(request.url, true);

  if (denyHosts.indexOf(requestUrl.hostname) != -1) {
    response.writeHead(301, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache'
    });
    response.end("Access denied.");
    return;
  }

  console.log(`Request hostname: ${requestUrl.hostname}`);

  // Формируем необходимые данные для запроса
  var options = {
    hostname: requestUrl.hostname.toString(),
    port: requestUrl.port,
    path: requestUrl.path.toString(),
    method: request.method.toString(),
    headers: request.headers.toString()
  };

  var encoding = "utf8";

  // Выполняем запрос
  // requestClient - экземпляр класса http.ClientRequest
  var requestClient = http.request(options, (result) => {
    result.setEncoding('binary');

    result.on('data', (chunk) => {

      var expressionOne = /meta http-equiv="content-type"/i;
      var expressionTwo = /meta charset/i;

      // В частях ответа ищем заголовки, в которых может быть указана кодировка

      var contentTypeIndex = chunk.search(expressionOne);
      contentTypeIndex = (contentTypeIndex == -1) ? chunk.search(expressionTwo) : contentTypeIndex;

      // Если он есть, значит, должно быть установлено значение charset

      if (contentTypeIndex != -1) {

        // Ищем позицию, где определяется кодировка

        contentTypeIndex = chunk.indexOf("charset=");
        if (contentTypeIndex != -1) {

          // Если она найдена, то копируем ее посимвольно в переменную encoding

          var encodingIndex = contentTypeIndex + "charset=".length;
          encoding = "";
          while (chunk[encodingIndex] != "\"") {
            encoding += chunk[encodingIndex];
            encodingIndex++;
          }
        }
      }

      body += chunk;
    });

    result.on('end', () => {
      var rawHeaders = result.rawHeaders;

      var contentTypeIndex = rawHeaders.indexOf('Content-Type');
      var contentTypeValue = rawHeaders[contentTypeIndex + 1];

      var imgTypeExpr = /image/i;
      var textTypeExpr = /text/i;

      var imgTypeRes = contentTypeValue.search(imgTypeExpr);
      var textTypeRes = contentTypeValue.search(textTypeExpr);

      console.log("End of request/response.");

      response.writeHead(result.statusCode, result.headers);

      if (imgTypeRes != -1) {
        response.end(body, 'binary');
        return;
      }

      if (textTypeRes != -1) {
        var headerEncodingIndex = contentTypeValue.indexOf('charset=');
        if (headerEncodingIndex != -1) {
          var headerEncodingValue = contentTypeValue.substring(headerEncodingIndex + 'charset='.length);
          response.end(body, headerEncodingValue);
          return;
        }
      }

      response.end(body, encoding);
    });
  });

  requestClient.on('error', (error) => {
    console.log(error);
  });

  requestClient.end();
});

server.listen(8080);
console.log('Listen 127.0.0.1:8080');
