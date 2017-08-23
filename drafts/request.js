var url = require('url');
var http = require('http');

// Данный массив содержит в себе кодировки, которые поддерживает nodejs
// Необходим для проверки кодировки, полученной в заголовке ответа
var supportEncodings = [
  'utf8', 'utf-8', 'ucs2', 'ucs-2',
  'utf16le', 'utf-16le', 'latin1', 'binary',
  'base64', 'ascii', 'hex'
];

// Массив, в котором хранятся сайты, доступ к которым необходимо ограничить
var denyHosts = [
  'gipnomag.ru', 'mychell.ru', 'manystars.ru',
  'opentests.ru', 'amur-bereg.ru'
];

var server = http.createServer();

server.on('request', function(request, response) {
  // response - экземпляр класса http.ServerResponse
  // request - экземпляр класса http.IncomingMessage

  // В data накапливаться поступающие данные
  var data = '';

  // Парсим запрашиваемый URL
  var requestUrl = url.parse(request.url, true);

  // Проверяем, не пытается ли пользователь получить доступ
  // к сайтам, посещение которых запрещено
  if (denyHosts.indexOf(requestUrl.hostname) != -1) {

    response.writeHead(403, {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/html; charset=utf-8'
    });

    response.end('<html><head><title>Доступ ограничен</title></head><body><h1 align="center">Доступ к запрашиваемому ресурсу ограничен.<h1></body></html>', 'utf8');

    return;
  }

  // Помещаем в заголовки информацию о том, что
  // необходимо получать только несжатые данные
  request.headers['accept-encoding'] = 'identity';

  console.log(`Request hostname: ${requestUrl.hostname}${requestUrl.path}`);

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

    // Определяем кодировку поступающих данных
    var contentTypeIndex = result.rawHeaders.indexOf('Content-Type');
    var contentTypeValue = result.rawHeaders[contentTypeIndex + 1];

    var charsetRes = contentTypeValue.search(/charset=/i);

    var headerEncodingValue = '';

    if (charsetRes != -1) {
      headerEncodingValue = contentTypeValue.substring(charsetRes + 'charset='.length).toLowerCase();
    } else {
      headerEncodingValue = 'binary';
    }

    // Необходимо выполнить проверку, поддерживается ли кодировка, переданная
    // в заголовке ответа от сервера
    var supported = supportEncodings.indexOf(headerEncodingValue) + 1;
    // Поступающие данные будут иметь кодировку,
    // установленную с помощью метода setEncoding
    if (!supported) {
      result.setEncoding('binary');
    } else {
      result.setEncoding(headerEncodingValue);
    }

    result.on('data', (chunk) => {
      data += chunk;
    });

    result.on('end', () => {
      console.log(`End of request/response with ${requestUrl.hostname}${requestUrl.path}.`);

      response.writeHead(result.statusCode, result.headers);
      response.end(data, headerEncodingValue);
    });
  });

  requestClient.on('error', (error) => {
    console.log(error);
  });

  requestClient.end();
});

server.listen(8080);
console.log('Listen 127.0.0.1:8080');
